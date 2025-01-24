
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
import re
import json
from sqlalchemy import text

# Step 1: Retrieve schema information (for MySQL and MongoDB)
def get_database_schema(db_connection, db_type):
    if db_type == "mysql":
        from sqlalchemy import inspect
        inspector = inspect(db_connection)
        schema_info = {}
        for table_name in inspector.get_table_names():
            columns = [col["name"] for col in inspector.get_columns(table_name)]
            schema_info[table_name] = columns
        return schema_info
    elif db_type == "mongodb":
        schema_info = {}
        for collection_name in db_connection.list_collection_names():
            collection = db_connection[collection_name]
            sample_document = collection.find_one()
            if sample_document:
                schema_description = "\n".join([f"{key}: {type(value).__name__}" for key, value in sample_document.items()])
            else:
                schema_description = "No data found in the collection."
            schema_info[collection_name] = schema_description
        return schema_info



# Helper function to generate SQL or MongoDB query from OpenAI
def get_query_from_openai(question, schema, chat_history, db_type):
    if db_type == "mysql":
        template = """
        Based on the table schema below, write a SQL query that would answer the user's question.
        <SCHEMA>{schema}</SCHEMA>
        Conversation History: {chat_history}
        Question: {question}
        SQL Query:
        """
    elif db_type == "mongodb":
        template = """
        You are an expert AI assistant skilled at translating questions into MongoDB aggregation pipeline queries.
        give in the fomate like "'db.<Collection_name>.aggregate([<aggregation pipeline queries>])
        in list the key are must use doublecoutes in the list

        Below is the schema information for each collection in the database.

    {schema}

    Based on this schema, analyze the user's question and return a MongoDB aggregation pipeline query specific to the 
    relevant collection(s) in the database. Only return the query code, without any additional explanation.
    
    User question: {question}
    Aggregation pipeline query:
        """

    prompt = ChatPromptTemplate.from_template(template)
    llm = ChatOpenAI(model="gpt-4-0125-preview", temperature=0)

    
    query_chain = (
        RunnablePassthrough.assign(schema=lambda _: schema)
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # Generate the raw query
    raw_query = query_chain.invoke({"question": question, "chat_history": chat_history})
    
    # Clean up query format
    clean_query = re.sub(r"```sql|```", "", raw_query).strip()

    if clean_query.startswith("json"):
        clean_query = clean_query[4:].strip()
    return clean_query




# Helper function to run MySQL or MongoDB query and get the result
def run_query(db_connection, query, db_type):
    if db_type == "mysql":
        with db_connection.connect() as connection:
            result = connection.execute(text(query))
            return result.fetchall()
    elif db_type == "mongodb":
        # If the query is a string, we parse and transform it for MongoDB execution
        if isinstance(query, str):
            # Corrected aggregation query with double quotes
            # query = 'db.Employees.aggregate([{"$project": {"_id": 0, "employee_id": 1, "first_name": 1, "last_name": 1, "department_id": 1, "position": 1, "salary": 1}}])'
            try:
                # Extract collection name and aggregation query
                collection_name = query.split(".")[1]  # Extract "Employees" as the collection name
                query_part = query.split(".aggregate(")[1].rstrip(')')  # Get the JSON part of the aggregation pipeline

                # Parse the query part into JSON format
                query = json.loads(query_part)  # Parse it into a JSON list

                # Check if the parsed query is a list (expected for aggregation pipelines)
                if not isinstance(query, list):
                    raise ValueError("Parsed query is not a valid list")
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid MongoDB query format: {e}")
            except IndexError:
                raise ValueError("Query parsing error: Invalid format for collection or query part")

        # Run the aggregation query if query is correctly parsed as a list
        if isinstance(query, list):
            collection = db_connection[collection_name]  # Dynamically access the collection
            result = collection.aggregate(query)  # Execute the aggregation query
            return [doc for doc in result]  # Convert the cursor to a list of documents
        else:
            raise ValueError("MongoDB query must be a list")




# Helper function to convert query response to natural language
def convert_to_natural_language(question, schema, query, sql_response, chat_history):
    template = """
    Based on the schema below, user question, query, and response, Answer to the user in natural language response like chatbot in order and clear formate.
    <SCHEMA>{schema}</SCHEMA>
    Question: {question}
    Query: <QUERY>{query}</QUERY>
    Response: {response}
    Generate a clear and concise response.
    """
    
    prompt = ChatPromptTemplate.from_template(template)
    llm = ChatOpenAI(model="gpt-4-0125-preview", temperature=0)
    response_chain = (
        RunnablePassthrough.assign(schema=lambda _: schema)
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return response_chain.invoke({"question": question, "query": query, "response": sql_response})
