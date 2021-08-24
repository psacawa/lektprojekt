=================================
DevOps/Infra
=================================

Brief description, not necessarily actual, of infrastructure and devops practices

Infrasture
----------

LektProjekt (aka ``https://www.lex.quest``) uses the following cloud infrastructure

AWS Cloud
^^^^^^^^^

- **AWS Elastic Kubernetes Service** via ``eksctl`` prefer managed node groups. Use spot instances when supported, save $$$. Control plane is **$76/month**...
- **AWS Elastic Container Registry** images are stored here
- **AWS ELB** the k8s ingress controller is AWS Elastic Load Balancer Controller, which
  created ALB
- **AWS RDS** Postgres RDB instance is outside of the k8s cluster
- **AWS Cloudfront** Audio files and other assets served via CDN
- **AWS Elasticache** Redis application cache is likewise outside of cluster
- **AWS SES** Simple Email Service sends transactional emails
- **AWS SNS** We have a topic hooked to SES to collect reports about email delivery
- **AWS S3** Origins for Cloudfront distributions, logging, assets..

Other Resources
^^^^^^^^^^^^^^^

- Google analytics
- OAuth2 applications with Google, Facebook
- Sentry projects
- Godaddy DNS - AWS Route53 doesn't yet support ``.quest`` TLD

Github Actions
--------------

test_backend/test_frontend/test_e2e
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

When a pull request is is submitted, these workflows are run if the code they pertain to
is modified. 

build_backend/build_frontend
^^^^^^^^^^^^^^^^^^^^^^^^^^^^

If a pull request is merged  (or ``master`` is pushed), the corresponding image is build
and pushed to  AWS ECR image repository

Kubernetes Cluster
--------------------

TODO: Describe the cluster components, helm charts, etc.

- ``lekt-backend`` deployment.  gunicorn wsgi server service API
- ``lekt-frontend`` deployment. nginx container service frontend JS bundle and   some
  assets
