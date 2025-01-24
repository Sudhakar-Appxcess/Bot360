# from fastapi import Response

# def set_access_token_cookie(token: str, response: Response):
#     response.set_cookie(
#         key="access_token",
#         value=token,
#         httponly=True,  # Prevents client-side JavaScript access
#         secure=False,    # Set to True in production for HTTPS
#         # max_age=30*60*1000
#         # samesite="Lax",
#         # path="/"        # Set the path as per your application's routing needs
#     )

from fastapi import Response

def set_access_token_cookie(token: str, response: Response):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,  # Prevents client-side JavaScript access
        secure=True,    # Set to True for HTTPS
        samesite="None",  # Required for cross-site contexts
        # max_age=30 * 60 * 1000,
        # path="/"         # Set the path as per your application's routing needs
    )
