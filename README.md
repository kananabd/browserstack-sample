## CLONE THE REPO
	- download and install git for version control
	- clone repo: https://github.com/kananabd/browserstack-sample

## PYTHON:
	- download and install python
	- set environment variable PYTHONPATH to point to test folder cloned in your local

## DEPENDENCIES
	- run below command in your shell.

    pip install -r requirements.txt
		

# How to run
	
	browserstack-sdk pytest ./hf.webTests/Tests/test_sample.py --browserstack.config "./hf.webTests/browserstack.yml"

