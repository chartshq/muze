# FusionCharts FusionBoard

**Table of Contents**

- [Repository Structure](#markdown-header-repository-structure)
- [Repository Structure of Development Directory](#markdown-header-repository-structure-of-development-directory)
	- [Branching and Tagging Policy](#markdown-header-branching-and-tagging-policy)
	- [Repository Write Access Permissions](#markdown-header-repository-write-access-permissions)
	- [Commit Guidelines](#markdown-header-commit-guidelines)
		- [Check for errors before committing](#markdown-header-check-for-errors-before-committing)
		- [Atomic commits](#markdown-header-atomic-commits)
		- [Clean commit message](#markdown-header-clean-commit-message)
- [Preferred IDE](#markdown-header-preferred-ide)
	- [Generic IDE settings](#markdown-header-generic-ide-settings)
- [Guidelines for writing Test Cases](#guidelines-for-writing-test-cases)
- [Guidelines for sending a Pull Request](#markdown-header-guidelines-for-sending-a-pull-request)
- [The CI Platform](#markdown-header-the-ci-platform)
	- [Ensuring your commits will not fail build](#markdown-header-ensuring-your-commits-will-not-fail-build)
	- [Executing individual build tasks](#markdown-header-executing-individual-build-tasks)
		- [npm run build](#markdown-header-npm-run-build)
	- [Accessing your build artefacts](#markdown-header-accessing-your-build-artefacts)

## Repository Structure


If you are looking to contribute to FusionBoard development, this directory has everything.  Make sure you read [CONTRIBUTING.md](CONTRIBUTING.md) (this file) if you are contributing for the first time.

## Repository Structure of Development Directory

Directory       | Summary
----------------|---------------------------------------------
`coverage`      | Code Coverage of the application
`dist`          | Script Build Artifacts
`src`           | Source code (.js files) as modules
`example`       | Templates to run code iterations

~~ to be documented further ~~

## Branching and Tagging Policy

This repository uses standard `git-flow` branch management policy/strategy. If you want to learn more on `git-flow`, refer  to [tutorial from Atlassian](https://www.atlassian.com/git/workflows#!workflow-gitflow) and more details at [http://nvie.com/posts/a-successful-git-branching-model/](http://nvie.com/posts/a-successful-git-branching-model/).

~~ to be documented further ~~

## Repository Write Access Permissions

The write access permission is formulated in such fashion that unwanted branching cannot happen and so that standards can be followed while creating new branches. Since the repository is directly tied up with our CI system, it also is targeted to ensure that a commit sanity is maintained.

Group           | Writeable Branches
----------------|---------------------------------------------
Administrators  | `master`
CodeOps         | `develop`, `release/*`
Developers      | `feature/*`, `support/*`, `hotfix/*`

> Deletion of `master`, `develop` and `release/*` is blocked.
> Rebasing on `master` is blocked.

## Preferred IDE
The preferred IDE for `fusionboard` project is Microsoft Visual Studio Code. You can download it from [https://code.visualstudio.com/download].

The repository has a project file configured with the best practices recommended for `fusionboard`. Things like using 120 character ruler, addition of end-of-file newline, cleaning up of trailing whitespace has been configured in this project.

Visual Studio Code provides IntelliSense, debugging, and powerful editor features for JavaScript. VS Code uses the JavaScript language service to make authoring JavaScript easy. In addition to syntactical features like format, format on type and outlining, you also get language service features such as Peek, Go to Definition, Find all References, and Rename Symbol.


### Generic IDE Settings

VS Code provides two different scopes for settings:

    - User :  These settings apply globally to any instance of VS Code you open
    - Workspace : These settings are stored inside your workspace in a .vscode folder and only apply when the workspace is opened. Settings defined on this scope override the user scope. 
    
In case you are using any other IDE, (not recommended) setting the following defaults of the IDE should help:

1. Set to true to ensure the last line of the file ends in a newline character when saving.
2. Use 120 the columns to display vertical ruler.
3. The number of spaces a tab is considered equal should be 4.
4. Insert spaces when tab is pressed.
5. Remove trailing white space on save.
6. Always use UTF-8 character encoding for reading and writing files.
7. Set IDE to not change file permissions upon editing.


## Commit Guidelines

The following best practices, coupled with a pinch of common-sense will keep the repository clean and usable in future. The idea is that everything that goes into the repository is not for an individual, but someone else who will be directly or indirectly affected by it.

### Check for errors before committing

Checking for errors should be done for each commit whether it is being pushed to remote or not.

First, you don't want to submit any whitespace errors. Git provides an easy way to check for this — before you commit, run `git diff --check`, which identifies possible whitespace errors and lists them for you. If you run that command before committing, you can tell if you're about to commit whitespace issues that may annoy other developers.

Secondly, you should ensure that your commit does not break builds. Run `npm test` on the repository to execute all sanity and smoke tests. If any test fail, do not change the test to pass your commit. The tests were there with a purpose. Discuss within your team to ensure that the changes that you do to test specs are valid. If you are adding a new feature, accompanying them with new tests are a good practice.
The `npm test` command uses karma with mocha and chai, along with ESLint based on the AirBnb Style Guide to check for errors in the code. It also does a static type checking of the code using Flow.

### Atomic commits

Try to make each commit a logically separate changeset. If you can, try to make your changes digestible — don't code for a whole weekend on five different issues and then submit them all as one massive commit on Monday. Even if you don't commit during the weekend, use the staging area on Monday to split your work into at least one commit per issue, with a useful message per commit. If some of the changes modify the same file, try to use `git add --patch` to partially stage files. The project snapshot at the tip of the branch is identical whether you do one commit or five, as long as all the changes are added at some point, so try to make things easier on your fellow developers when they have to review your changes. This approach also makes it easier to pull out or revert one of the changesets if you need to later. There are a number of useful Git tricks for rewriting history and interactively staging files — use these tools to help craft a clean and understandable history.

### Clean commit message

*More detailed explanation include your motivation for the change and contrast its implementation with previous behavior — this is a good guideline to follow.*

Getting in the habit of creating quality commit messages makes using and collaborating with Git a lot easier. As a general rule, your messages should start with a single line that’s no more than about 50 characters and that describes the changeset concisely, followed by a blank line, followed by a more detailed explanation.

It's also a good idea to use the imperative present tense in these messages. In other words, use commands. Instead of "I added tests for" or "Adding tests for," use "Add tests for."

You should see if your commit message answers the following questions:
Answer the following questions:

1. **Why is this change necessary?**
2. **How does it address the issue?**
3. **What side effects does this change have?**

The first question tells reviewers of your pull request what to expect in the commit, allowing them to more easily identify and point out unrelated changes.

The second question describes, at a high level, what was done to affect change. If your change is obvious, you may be able to omit addressing this question.

The third is the most important question to answer, as it can point out problems where you are making too many changes in one commit or branch. One or two bullet points for related changes may be okay, but five or six are likely indicators of a commit that is doing too many things.

A good commit message template

```
Short (50 chars or less) summary of changes with relevant project management issue ID.

More detailed explanatory text, if necessary.  Wrap it to about 72 characters or so.  In some contexts, the first line is treated as the subject of an email and the rest of the text as the body.  The blank line separating the summary from the body is critical (unless you omit the body entirely); tools like rebase can get confused if you run the two together.

Further paragraphs come after blank lines.

 - Bullet points are okay, too

 - Typically a hyphen or asterisk is used for the bullet, preceded by a single space, with blank lines in between, but conventions vary here
```

Run `git log --no-merges` to see what a nicely formatted project-commit history looks like.

## Filenames to avoid

Do not add a file with filenames having any of the following pattern(s):


| Pattern               | Reason
|-----------------------|---------------------------
|                       | 
~~ to be documented further ~~

## Guidelines for sending a Pull Request

Commit to master branch and develop branch is locked. As such, `git-flow` for feature completion and release will not work. Thus, the last steps of feature completion in `git-flow` will happen as a Pull Request from BitBucket website. You may refer to [https://confluence.atlassian.com/display/BITBUCKET/Work+with+pull+requests](https://confluence.atlassian.com/display/BITBUCKET/Work+with+pull+requests) for basics on sending Pull Request on BitBucket.

1. Pull Request should not be accepted with a test failure. Ensure that `npm test` passes on the `head` of your feature branch.
2. Ensure that your feature branch has been tested and if it is associated with issues from corresponding issue-tracker, the issue must be in a "closed" state, implying that the issue has been fully tested, and accepted for inclusion in product.
3. Pull Requests with merge conflict are very difficult to review. Ensure that the `head` of your feature branch is either already merged with `develop` or has no conflict when it is merged with `develop`.
4. Pull Request comment and commit comments should explicitly discuss what changes were made. The Pull Request reviewer should not need to communicate out of scope of Bitbucket and JIRA to understand what changes has been done.
5. Pull Requests, for this repository, are **not** code review or feature review - they are simply managed merging process by a handful of us to ensure parity and uniformity.
6. Pull Request assumes that the code has been reviewed, tested and feature (or part-feature, or task,) works as accepted.
7. The turn around time to close Pull Request is directly proportional to the delta of changes done - more the change in files, more time it would take. As such, if you anticipate a feature branch to have a large delta on feature completion, break it into sub-issues of the issue-tracker, test them, close them, and then send PR for that branch.
8. Turn around time for Pull Request would get affected if commit messages are unclear.
9. If you have deadlines to ensure feature completion, send Pull Request ahead of time. Better still, ensure your feature development timeline accounts for PR acceptance.
10. If you have mentioned JIRA issues in Pull Request commits or commit messages, the severity and priority of those issues will be taken into account. Otherwise, no Pull Request will take priority over others already in queue - it is first-pull first-merge!

## Guidelines for writing Test Cases

Test Cases to be added can be added with the following format :

	Test case id 		– (Unique Identifier)
	Test case Title 	– (Short description of test case & should be effective to convey the test case)
	Test case Summary 	– (Detailed description of test case & additional information needed for the test case to execute)
	Pre-condition/Test data – (Any pre-requisite required to execute the test case)
	Test Steps 			– (Actual step to be followed or executed)
	Excepted Result 	– (Result which is expected as a normal behavior)
	Actual result		– (Result which we actually get after we execute the test step)
	Test Case Status	- (Pass/Fail)
	Comments 			– (Additional Comments or any note required to while executing test case or special note to tester which need to be consider)

-	Test cases should be simple and easy to understand
-	Concentrate on real life scenarios first which end user going to use day to day life 
-	Do not assume any requirements by your own
-	Test Cases should not be repeated
-	Assign priority to each test case added

## Documentation guidelines

We use [JSDoc](http://usejsdoc.org) as our documentation platform. All API documentation and end-user documentation is produced using JSDoc.

 - API documentations are written in source code present in the `develop/src` directory.
 - End-user documentation are written as [JSDoc tutorials](http://usejsdoc.org/about-tutorials.html) in Markdown syntax. These tutorials are kept in `develop/docs` directory.

### Things to remember

~~ to be documented further ~~

## The CI Platform

The CI system is built as a bunch of bash scripts to execute a set of tasks. These scripts are meant to execute tasks that can run on every local machine. In general, knowledge about these scripts are not necessary for development.

**The scripts are to be only accessed using `npm run script`.** This ensures that the execution point of the scripts (`pwd`) is always the repository root.

### Ensuring your commits will not fail build

> `npm test`

The script associated with `npm test` will run all tests that ensures that your commit does not break anything in the repository. As such run `npm test` before you push.


### Executing individual build tasks

> `npm start`

The script associated with `npm start` uses webpack middleware to serve a webpack bundle which is also connected to the server via sock.js. 

> `npm lint`

The script associated with `npm lint` will run linting tests that ensures that their are no bugs inconsistent with ECMAScript/JavaScript code. The linter uses the Airbnb style guide with some overridden rules for the same. As such run `npm lint` before you push.

> `npm docs`

The script associated with `npm docs` will generate the documentation for the code.

> `npm flow`

The script associated with `npm flow` will run a static type check on the code.

#### npm run build

This builds the application, after running the tests and other processes attached to it. Once the build is complete, the build artifacts can be retrieved.

### Accessing your build artefacts

All scripts output build artefacts to `./dist`
The artefacts are located at ~~ to be documented further ~~

---
*Sections of this document uses excerpts from various books and the Internet. [http://git-scm.com/book/](http://git-scm.com/book/) is one of the dominating influencers.*
