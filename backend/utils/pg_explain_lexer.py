# vendored in from:
# https://github.com/maahl/pg_explain_lexer/raw/master/pg_explain_lexer.py

from pygments.lexer import RegexLexer, bygroups, words
from pygments.token import *


class PgExplainLexer(RegexLexer):
    name = "Postgres Explain"
    aliases = ["pg_explain"]
    filenames = []

    tokens = {
        "root": [
            (r"(\s+|:|\(|\)|ms|kB|->|\.\.)", Punctuation),
            (
                r"(cost=|rows=|width=|loops=|time=|exact=|actual|Memory Usage|Memory|Buckets|Batches|originally|rows)",
                Comment.Single,
            ),
            (
                r"(Sort Key|Group Key)(: )",
                bygroups(Comment.Preproc, Punctuation),
                "object_name",
            ),
            (
                r"(Sort Method)(: )",
                bygroups(Comment.Preproc, Punctuation),
                "object_name",
            ),
            (
                r"(Join Filter|Filter|Merge Cond|Hash Cond|Index Cond|Recheck Cond)(: )",
                bygroups(Comment.Preproc, Punctuation),
                "predicate",
            ),
            (
                r"(Parallel )?Seq Scan on |(Parallel )?Bitmap Heap Scan on |Bitmap Index Scan on |Subquery Scan on |Insert on ",
                Keyword.Type,
                "object_name",
            ),
            # "using" operators
            (
                r"((?:Parallel )?Index (?:Only )?Scan using )(\w+(?:\.\w+)*)( on )",
                bygroups(Keyword.Type, Name.Variable, Keyword.Type),
                "object_name",
            ),
            # operator arguments or details
            (
                r"(Sort Method|Join Filter|Rows Removed by Join Filter|Rows Removed by Filter|Planning Time|Execution Time|Heap Fetches|Heap Blocks|Workers (Planned|Launched)|never executed)",
                Comment.Preproc,
            ),
            # simple keywords
            (
                r"(Sort|Nested Loop Left Join|Nested Loop|Merge (Left |Right )?Join|Hash (Right|Left|Full) Join|(Parallel )?Hash Join|(Parallel)?Hash|Limit|(Finalize |Partial |Group)?Aggregate|Materialize|Gather( Merge)?)|(Merge )?Append|Result|ProjectSet|Bitmap(Or|And)",
                Keyword.Type,
            ),
            # strings
            (r"'(''|[^'])*'", String.Single),
            # numbers
            (r"[0-9]+(\.[0-9]+)?", Generic.Strong),
            # explain header
            (r"\s*QUERY PLAN\s*\n-+", Comment.Single),
        ],
        "expression": [
            # matches any kind of parenthesized expression
            # the first opening paren is matched by the 'caller'
            (r"\(", Punctuation, "expression"),
            (r"\)", Punctuation, "#pop"),
            (r"[^)]*", Name.Variable),
        ],
        "object_name": [
            # matches possibly schema-qualified table and column names
            # if object_name is parenthesized, mark opening paren as
            # punctuation, call 'expression', and exit state
            (r"\(", Punctuation, "expression"),
            (r"\)", Punctuation, "#pop"),
            (r"\w+(\.\w+)*( USING \S+| \w+ USING \S+| \w)?", Name.Variable),
            # if we encounter a comma, another object is listed
            (r", ", Punctuation, "object_name"),
            # special case: "*SELECT*"
            (r'"\*SELECT\*"', Name.Variable),
            (r"", Punctuation, "#pop"),
        ],
        "predicate": [
            # if predicate is parenthesized, mark paren as punctuation
            (
                r"(\()([^\n]*)(\))",
                bygroups(Punctuation, Name.Variable, Punctuation),
                "#pop",
            ),
            # otherwise color until newline
            (r"[^\n]*", Name.Variable, "#pop"),
        ],
    }
