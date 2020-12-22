# Miscellaneous Frontend Information

## Views

Notes on frontend views that must be made, along with API endpoints each must be able to
call, and what data must be available on the corresponding serializers.

### LexemeBrowsingView

- list languages
  - base Language
- filter phrase pair by lexeme
  - base, target
  - associated lexeme character span

### AnnotationBrowsingView

- list languages
- filter phrase pair by annotation

  - base, target
  - associated annotations' lexemes character spans

- filter word by annotation

### PhrasePairDetailView

- phrase pair detail
  - associated words
  - associated annotations
  - associated phrase word data
