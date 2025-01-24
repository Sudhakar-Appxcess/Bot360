import os
from fastapi import APIRouter, Depends, HTTPException, Request
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain import hub
from app.core.database.vector_store import get_vector_store
from fastapi.security import OAuth2PasswordBearer
from app.core.security import get_current_user 

router = APIRouter()

# Initialize the LLM
llm = ChatOpenAI(
    openai_api_key=os.environ.get('OPENAI_API_KEY'),
    model_name='gpt-4o-mini',
    temperature=0.0
)

# Initialize the retrieval chain
retriever = get_vector_store().as_retriever()
retrieval_qa_chat_prompt = hub.pull("langchain-ai/retrieval-qa-chat")
combine_docs_chain = create_stuff_documents_chain(llm, retrieval_qa_chat_prompt)
retrieval_chain = create_retrieval_chain(retriever, combine_docs_chain)



@router.get("/ask")
async def query(user_question: str,request: Request):
                # , current_user: dict = Depends(get_current_user)):
    # print(current_user)
    try:
        print("Endpoint '/ask' was hit")  # Confirm the endpoint was hit

        # Print cookies received from the client
        # print("Received cookies:", request.cookies)

        print("User Question:", user_question)
        # Query the retriever for relevant documents
        relevant_docs = retriever.get_relevant_documents(user_question)

        # Check if any documents are retrieved
        if not relevant_docs:
            return {
                "answer": "Answer is not available in the context."
            }

        knowledge_prompt = (
            "Answer the user's question clearly and helpfully, using only the provided context. "
            "Your are the chat bot, response like professional way to the users"
            "Try to asnwer as much as accurite answer, if not try to answer the releated data that get from the relevenet docs"
            "Ensure the response is valuable and easy to understand, but only answer from the document or data having"
        )



        # Combine the prompt with the query and relevant documents
        combined_input = knowledge_prompt + user_question

        # Use the LLM to answer based on retrieved documents
        answer_with_knowledge = retrieval_chain.invoke({"input": combined_input})

        # Return only the knowledge-based answer
        return {"answer": answer_with_knowledge['answer']}
    
    except Exception as e:
        print(f"Error: {e}")  # Log the exception
        return {"error": "An error occurred while processing the request."}
