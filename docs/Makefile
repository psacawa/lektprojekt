build: *.rst
	sphinx-build . build

publish: 
	# FIXME 23/08/20 psacawa: this is currently broken
	aws s3 sync build s3://lektprojekt-docs
	cd build
	aws cloudfront create-invalidation --distribution-id E17TQ31GUWBDSW --paths $(printf '/%s'  *.html)
