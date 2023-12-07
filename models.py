from pydantic import BaseModel, validator, constr

class UserInput(BaseModel):
    username: str
    password: str
    
    @validator("password", "username")
    def check_whitespace(cls, v):
        if " " in v:
            raise ValueError("Cannot contain whitespace.")
        return v
    
    @validator("password")
    def check_length_password(cls, v):
        if len(v) < 8:
            raise ValueError("Must be at least 8 characters.")
        return v
    
    @validator("username")
    def check_length_username(cls, v):
        if len(v) < 4:
            raise ValueError("Must be at least 4 characters.")
        return v