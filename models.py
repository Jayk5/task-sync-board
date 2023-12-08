from pydantic import BaseModel, validator


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


class ItemInput(BaseModel):
    title: str
    description: str = None

    @validator("title")
    def check_length(cls, v):
        if len(v) < 1:
            raise ValueError("Must be at least 1 character.")
        return v


class ColumnInput(BaseModel):
    title: str

    @validator("title")
    def check_length(cls, v):
        if len(v) < 1:
            raise ValueError("Must be at least 1 character.")
        return v


class BoardInput(BaseModel):
    title: str

    @validator("title")
    def check_length(cls, v):
        if len(v) < 1:
            raise ValueError("Must be at least 1 character.")
        return v
