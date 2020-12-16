# Proposal Outline

This document sets out some of the pain points of language learning, elaborates a few basic insights into language learning that might be leveraged to provide value to language learners. Next it sketches a product that might leverage those insights, how it might be marketed, and the business that might surround it.

Needless to say, the opinions about secondary language acquisition laid out are my own, and I speak from a personal perspective.

For concreteness, I will take the perspective of a English speaker learning Spanish. These will occasionally be referred to as the **base language** and the **target language**, respectively.

# Remarks about Secondary Language Acquisition
## How to Get Good at a Second Language
The basic ingredient necessary to get to an *advanced* with another language is **active**, **varied** practice in **realistic context**. 

By **active**, I mean that the language learner must engage with the most difficult aspects of the second language, and should not primarily be a passive recipient of media from that language. Therefore, reading the newspaper in  the target language or watching TV are not as valuable as producing written or spoken language respectively. The main reason seems to be that in understanding passively received language, the learner can lean upon the implicit prior assumption that the text will be meaningful, which highly constrains the ways it can be interpreted. Therefore, e.g. most people know roughly what topics and literary style of newspapers, and are unlikely to have their interpretive faculties tested by reading it.

By **varied**, I just mean that it can't be some rote textbook nonsense, i.e. "use Préterito to fill in the blanks in the following five examples." Rule-based learning is fine for beginners, but is insufficient beyond that. 

By **realistic context**, I mean that the practice should be verisimilar to reality: it should ideally be like normal conversation in the target language. If the learner cannot suspend disbelief and stops mentally identifying the practice as real conversation, then he tends to treat it as a rule-based game, which is not very instructive.

## A Basic Dichotomy of Language Tasks
Language tasks can be categorised into four basic types as presented in the  2x2 table below:

|  | Reception (Passive) | Production (Active)  | 
| ------------- |:-------------:|:-----:|
| Written Language | Reading | Writing  | 
| Spoken Language  | Listening | Speaking | 

On one axis, there is the type of language(written/spoken), on the other axis, there is the type of practice(reception/production of language). 

Interviews with potential clients reveal that the four types are typically ordered in terms of difficulty as follows: **Reading < Listening < Speaking < Writing**.

The two tasks associated with production are that involve **active** learning. Therefore a learner should prefer speaking and writing to reading and listening.

## What the Majority of Language Learners Desire
If we go by their stated preferences, most second language learners want fluency in the spoken language. A large group consists of those who have attained an intermediate level in their target language, and have stagnated in trying to reach the advanced level. This group consists largely of those with English as a second language language.

## The Effect of Context on Language Production
A lot to say here, to it's mostly in the manner of justification of the approach of the product.
**+ TODO:  <30-11-20, psacawa> +**

## Spaced Repetition Learning
Spaced repetition is of fundamental importance in learning large quantities of information. As Wikipedia says: 

> Spaced repetition is an evidence-based learning technique that is usually performed with flashcards. Newly introduced and more difficult flashcards are shown more frequently, while older and less difficult flashcards are shown less frequently in order to exploit the psychological spacing effect. The use of spaced repetition has been proven to increase rate of learning.

The premise is that a system can facilitate the scheduling aspect of what to review on a particular day. This is highly convenient for learners, as it is basically impossible to do this in a deliberate manner oneself. That would entail remembering to review the very same thing you're at risk of forgetting! A paradox!

Spaced repetition systems are everywhere, and in 2020 are nothing amazing. I am mentioning them because of their basic importance. Any product I envision would be such a system.

## How to Provide Value to Language Learners
A lot to say here
**+ TODO:  <01-12-20, psacawa> +**

# Summary of Interviews with Potential Clients
## Joanna P
+ Mrs. Joanna wanted to learn Spanish to take a cooking lesson when she was in Cuba(?)
+ Duolingo proved ineffective. She didn't remember anything later on.
+ After hearing the proposal of an application creating learning plans for particular  She wanted to be able to use an application in a hands-free fashion while driving during her daily commute.

## Max K
+ Was not interested in the idea of filtering a corpus of text with respect to selected words/grammatical structures. Instead, he wanted a portal where he could arrange to have 1-on-1 conversation with a native speaker of his target language.
+ He might like the idea of a linguistically enhanced chatbot to converse with. On the other hand, speaking with an actual person involves enriched communication we are unable to offer.

## Pamela A
+ Expressed frustration with not knowing any "long tail" terms in the target language: despite moving to Canada as a teen, she still got caught by some rarely occurring terms. For example, despite being fluent, she didn't know the term *jigsaw puzzle*.
+ Was interested in learning idioms so she could seem more fluent.

# Evaluation of an Existing Product
## Duolingo
To put it briefly, it's a kids video game and it sucks. 

There is a lot of media: If you select French, there a video of a woman saying <Bonjour!>. There is a progression tree of modules for a given language. In Spanish, you start learning words like *perro* and *Hola!* and progress far up the tree before you have much choice in what you learn. 

All the modules give you very poor choices in language tasks: it is typical to be asked the meaning of a target language word; the answer must be selected from a multiple-choice prompt of four base language words. The prompt is *perro* and the required answer is *dog*. There is even a cartoon dog shown with the prompt just in case your last brain cell gives out. This is extremely passive learning, and quite worthless. 

Further experiences are similar. The overall impression is that the product is targeting  fad learners. For that reason, a product we create targeting the niche of serious learners shouldn't necessarily be considered a competitor to Duolingo  et al.

# Business Proposal
## Product Proposal
The proposed product is a web application available to clients through their browser on mobile or on desktop. It consists of two modes.

### Spacy Background

For every language we plan to serve, the NLP library `spacy` has a model we includes among other things, a tagger and neural embeddings. The tagger is able to attach to tokens in a sentence the grammatical data about them.  For example, the first phrase pair of the English-Spanish parallel corpus is 

+ *Meteorologists say that the storm should arrive in the area in the late afternoon.*
+ *Los meteorólogos dicen que la tormenta debería llegar a la zona por la tarde.*

The models used to analyze them are referred to in `spacy` as [`en_core_web_md`](https://spacy.io/models/es) [`es_core_news_md`](https://spacy.io/models/en) respectively. Each has its own tagging scheme on detailed on the linked pages. The part of the speech and tag assigned by the models are shown below.

```
text            lemma_         pos_    tag_    
--------------  -------------  ------  ------  
Meteorologists  meteorologist  NOUN    NNS     
say             say            VERB    VBP     
that            that           SCONJ   IN      
the             the            DET     DT      
storm           storm          NOUN    NN      
should          should         VERB    MD      
arrive          arrive         VERB    VB      
in              in             ADP     IN      
the             the            DET     DT      
area            area           NOUN    NN      
in              in             ADP     IN      
the             the            DET     DT      
late            late           ADJ     JJ      
afternoon       afternoon      NOUN    NN      

text          lemma_       pos_    tag_
------------  -----------  ------  -----------------------------------------------------------
Los           Los          DET     DET__Definite=Def|Gender=Masc|Number=Plur|PronType=Art
meteorólogos  meteorólogo  NOUN    NOUN__Gender=Masc|Number=Plur
dicen         decir        AUX     VERB__Mood=Ind|Number=Plur|Person=3|Tense=Pres|VerbForm=Fin
que           que          SCONJ   SCONJ
la            lo           DET     DET__Definite=Def|Gender=Fem|Number=Sing|PronType=Art
tormenta      tormenta     NOUN    NOUN__Gender=Fem|Number=Sing
debería       deber        AUX     AUX__Mood=Cnd|Number=Sing|Person=3|VerbForm=Fin
llegar        llegar       VERB    VERB__VerbForm=Inf
a             a            ADP     ADP__AdpType=Prep
la            lo           DET     DET__Definite=Def|Gender=Fem|Number=Sing|PronType=Art
zona          zona         NOUN    NOUN__Gender=Fem|Number=Sing
por           por          ADP     ADP__AdpType=Prep
la            lo           DET     DET__Definite=Def|Gender=Fem|Number=Sing|PronType=Art
tarde         tardar       NOUN    NOUN__Gender=Fem|Number=Sing
```

For some models, the tags are obscure. However, there's a utility: for example, `spacy.explain("NNS")` yields `"noun, plural"`. In the Spanish example, part of speech and other grammatical data are encoded into a string tag. For instance, we learn that *debería* ("should") plays the role of **Aux**iliary  verb, with **Cond**itional mood, in the **sing**ular *'*third** person.

The particular grammatical tags vary by language, and the encodings are ad hoc. Restricting our attention to European languages, we discern the following features of tokens which are of interest to users: 

+ part of speech
+ grammatical gender
+ person (1st,2nd,3rd)
+ plurality
+ tense
+ grammatical mood
+ grammatical case (in German, Russian, Polish)

We refer to the above as **features of tokens**. They can also be considered features of the enclosing phrases if they appear in them. In that sense, we would say the conditional mood is a **feature** present in the above Spanish example. In that sense, we add one other `feature of phrases`:

+ a given word `w` appears in the phrase

Some annotated features, such as `AdpType=Prep` are not that interesting. This one just says that the adposition is a preposition instead of a postposition. The data can come along for the ride, but it most likely won't be useful. Some features amount to `spacy` saying "I don't know what this is." That has been used to cleanse the dataset of questionable examples.

In addition to this, `spacy` also comes with neural embeddings for the languages. These can be uses as features (in the sense of feature engineering) that can power semantic analyses, for example to detect similarity between sentences and idioms they might contain. That would allow one to treat the predicate `contains idiom X` as an annotated feature. However, the feasibility of this is speculative.

### Repetition Mode: A Linguistically-Enhanced Spaced Repetition System
This is most basic and fundamental mode of the application. 

#### Data Tracked

Repetition mode treat grammatical features and words asymmetrically. At any given point, a certain set of words in the target language are being **tracked**. The set of tracked words is referred to as the **active vocabulary**. For each word, it will track a number representing its belief about how well the user knows the word is stored. We call this the **knowledge coefficient** These coefficients decay with time in the manner foreseen by the spaced repetition learning methodology. Words can be manually selected for tracking, individually (or perhaps in topical packages?). Additionally, as part of onboarding, the user declares their degree of competence in the target language. Depending on that, a certain number of the most common words are added to the active vocabulary.

Repetition mode has two submodes: normal and focus training.

#### Normal Repetition Mode

During normal repetition, the words in the active vocabulary whose knowledge coefficients have fallen the lowest are selected for practice. Examples are selected that have a high degree of incidence of these words. Users are prompted with new examples of this type until a daily quota is reached. Internet points are awarded.

On occasion, a new word is automatically added to the active vocabulary. This happens if the system deems the user to know his active vocabulary quite well. The word added should be the one that is most commonly occurring among those that are still untracked. Internet points are awarded accordingly.

This mode is designed with the thought that the user feels a gradual sense of progression and improvement. 

#### Focus Repetition Mode

This submode allows a user to focus a particular set of features and words. They enter into a *training plan* creation screen, were they select a small number of the grammatical features and words to focus on in the focus training session. The words can be ones that are already tracked. Then, they do practice which focusses on the features of the selected training plan with high exclusivity.  These training plans can be saved in their account. The active vocabulary is uses to form a weak prior for which examples to select.

This addresses the user desire for immediate focussed training in a particular aspect of grammar. The user may have a sizeable active vocab and one day say 

> "Let me practice subjunctivo and conditional in the third person. I need to practice that specifically."

Then examples having those features will be selected, favouring those containing words in the active vocabulary.

#### What "Practice" Actually Looks Like
**+ TODO: elaborate this. What is the feedback mechanism? +**

Speaking in summary, it's similar to `Anki`. The user is show the base language phrase, and their task is to speak aloud the target language translation. After trying, the target language sentence is revealed. A hands-free mode is supported, where they're given a set number of seconds to accomplish the task. Either they self-assess their success, or some AI voodoo magic does it for them.
 
### Conversation Mode: A Linguistically-Enhanced Chatbot
The premise here is quite simple, though whether this can be done is speculative. Users may desire to improve their language skills via somewhat realistic conversation about a topic of their choosing. Existing examples show that GPT-3 can be made to behave as a chatbot.  

To make it "linguistically enhanced", we should want the chatbot the user to be able to constrain the words and grammatical features that the chatbot will use. 

The feature sets saved on a user's account from repetition mode could be recycled here. Imagine the following user experience: 

> Joanna is trying to learn cooking vocabulary and simultaneously the subjunctivo in Spanish. She has a training plan saved for this in repetition mode. Now she goes to the conversation mode, and prompts the chatbot "Let's talk about cooking using the subjunctive." using the training plan I already made. 
> The chatbot prompts her accordingly.

It's unclear if this can really be made to work. We should consider it a point to research. It would provide a lot of value.

### Point of Contact with Users
Users will be able to access the application via the browser through the desktop or mobile phone. It's desirable to let the client use the product offline. In this case, the browser client will need to be a PWA: it'll will need to store a users' data to `localstorage` and support the "install prompt" browser API.

We can consider also making a native application for either of the major smartphone vendors' platforms. With carefully choice of technology, you can recycle the web application to make a hybrid mobile application and achieve "write once, run anywhere".

## Business Model
I propose a subscription business model: Users pay a monthly fee for access to our database of parallel corpora, practice plan builder, and virtual buddy. The access is granted for all pairs of base/target language.
 
## Marketing Channels
For the most part I am hopeless at brainstorming this however:

+ There are particular communities devoted to language learning. It's a big market. Some organic marketing there may work.
+ There are podcasts dedicated to the pursuit of language learning as a hobby. A quick Google search turns up a promising result:
*[Top 60 Language Learning Podcasts You Must Follow in 2020](https://blog.feedspot.com/language_learning_podcasts/)*. An avenue to market the product may be to simply solicit an invitation to be a guest on these podcasts and describe it during the interview. My sister has some experience with this sort of thing.

## What Needs to Be Done
* Parallel language corpora for several pairs of languages has to be attained (scraped) from internet sources. The resulting corpus needs to be run through a natural language processing machine like *Spacy* to extract relevant grammatical elements in the corpora. 
    * This has already been done for English-Spanish pair
    * The focus should be on pairs of Indo-European languages
* *(Optional)* A way needs to be found to discern the presence of particular idioms in the example pairs of the example corpora. This doesn't come "off the shelf" with the natural language processing libraries that I'm aware, but can surely be attained.
    * Since idioms are such a common pain point for learners, this would be a way to really provide value for the client. 
* *(Optional)* The feasibility of inducing GPT-3 to produce speech containing particular elements of speech (either words or particular grammatical constructs) while simultaneous holding a conversation on a particular topic must be investigated
    * If feasible, this would be a dream and would provide a lot of value for the client. 
* A backend serving access to the database and a frontend suitable for desktop and mobile browser should be built.
* *(Optional)*  A native (hybrid) mobile should be made.
* The product should be marketed in the channels listed above and iterated upon.

**+ TODO: distinguish reseach from actual tasks in the above list  <01-12-20, psacawa> +**
