from ariadne import QueryType

from .project_resolver import resolve_projects

# Import all the resolvers here

# Query is exported to be used in make_executable schema
query = QueryType()


def resolve_hello(*_):
    return "Hello, World"


# Import and set all the resolvers here
query.set_field("hello", resolve_hello)
query.set_field("projects", resolve_projects)
