# Pavani Durga C --- Literature Research Dossier

**Project:** *Cryptography Through Abstract Algebra: An Interactive
Study of Three Transformation Systems*\
**Project deadline:** 24 October 2026\
**Role:** Literature research and related work\
**Dossier purpose:** Provide an auditable record of source discovery,
source verification, source-to-claim mapping, limitations, and the
literature contribution to the final research paper.

## 1. Assignment and scope

Pavani's assigned work is to identify approximately 5--8 relevant
academic sources, verify each source, map sources to the claims they
support, identify cautious research gaps, and provide a dossier of
approximately 3--5 pages together with an annotated bibliography and
source-to-claim table.

The project studies three mathematical transformation systems: 1. Caesar
cipher, expressed through additive shifts modulo the alphabet size. 2.
Affine cipher, expressed through multiplication and addition modulo the
alphabet size. 3. Permutations on four elements, studied using the
symmetric group (S_4).

The mathematical focus is abstract algebra and the structure of
transformations. The website is supporting educational/implementation
evidence. (S_4) is a group of permutations, not itself a standard
encryption algorithm.

**Scope boundary:** This dossier documents the literature work and
verified sources currently available. It does not claim that all eight
initial candidate sources have been fully checked or read. The three
sources below are the sources used in the revised literature review.
Exact statistics not checked against primary-source tables are
intentionally omitted.

## 2. Research questions guiding source selection

The source search was organized around these questions:

-   What mathematical ideas underlie Caesar and Affine transformations?
-   How have interactive tools been used to teach cryptography or the
    mathematics related to cryptography?
-   What educational literature discusses the learning of group-theory
    concepts such as identity, inverses, composition, and group
    operations?
-   Do the sources reviewed describe a single tool that combines Caesar,
    Affine, and (S_4)-based permutation demonstrations with explicit
    explanations of the relevant algebraic structures?

The last question is exploratory. The available sources are not a
systematic review of the entire field, so the answer cannot be used to
claim that the project is the first of its kind.

## 3. Search and verification workflow

The project workflow and available files indicate the following process:

1.  Build a candidate list from the Elicit source matrix and Semantic
    Scholar shortlist.
2.  Search candidate titles/authors and verify bibliographic identity
    against publisher or DOI records.
3.  Prefer legitimate publisher PDFs or open-access full text when
    available.
4.  Use NotebookLM to extract source-grounded notes from uploaded
    materials.
5.  Audit the notes against the actual title page and publisher record;
    do not trust a filename alone.
6.  Separate source metadata, abstract-level information, full-text
    findings, and claims that still require checking.
7.  Synthesize only the claims that the sources can support.
8.  Maintain a source-to-claim map and disclose unresolved details
    rather than guessing.

### Search artefacts available

-   `Pavani_Semantic_Scholar_Shortlist.xlsx` --- candidate shortlist and
    instructions.
-   `Pavani_Priority_Literature_Sources.csv` --- priority source list.
-   `Elicit - Algebraic Cryptography Literature Source Matrix.csv` ---
    original source matrix.
-   `PAVANI_RESEARCH_TASK.md` --- research task and evidence rules.

**Search transparency:** The artefacts show a candidate-selection
workflow. They do not, by themselves, prove that every candidate was
found on Semantic Scholar, that every full text was read, or that the
search was exhaustive. The final paper should not describe this as a
systematic literature review unless a reproducible search protocol and
screening record are completed.

## 4. Annotated bibliography of sources used

### Source A --- Interactive mathematics related to cryptography

**Reference**

Trigui, M. S., & Alghazzawi, D. M. (2012). Learning the related
mathematics to cryptography by interactive way. *International Journal
of Modern Education and Computer Science, 4*(2), 8--14.
https://doi.org/10.5815/ijmecs.2012.02.02

**Stable links:** [Publisher
page](https://www.mecs-press.com/ijmecs/ijmecs-v4-n2/v4n2-2.html) ·
[PDF](https://www.mecs-press.com/ijmecs/ijmecs-v4-n2/IJMECS-V4-N2-2.pdf)

**Contribution to review:** The publisher record describes an online
interactive environment using modular arithmetic in a virtual learning
environment and reports a case study involving students at King
Abdulaziz University. The publisher describes the usability evaluation
positively across learnability, usefulness, ease of use, and outcome.

**Relevance:** Supports the background that interactive environments
have been developed for teaching mathematics related to cryptography.

**Limitations:** Usability and self-reported perceptions are not the
same as objectively measured learning gains. Exact questionnaire values
from the earlier NotebookLM notes were not carried into the review
because the numbers were not independently checked against the
primary-source tables during this finalization.

### Source B --- Cryptographic education tool

**Reference**

Abuzaid, A., Yuan, X., Yu, H., & Chu, B. (2011). The design and
implementation of a cryptographic education tool. In *Proceedings of the
3rd International Conference on Computer Supported Education (CSEDU
2011)* (Vol. 1, pp. 193--198). SciTePress.
https://doi.org/10.5220/0003301301930198

**Stable links:** [Publisher
record](https://www.scitepress.org/Papers/2011/33013/) ·
[PDF](https://www.scitepress.org/PublishedPapers/2011/33013/pdf/index.html)

**Contribution to review:** The publisher record and accessible paper
describe a visualization-based interactive tutorial for exploring
cryptographic algorithms and processes such as key generation,
encryption, and decryption, with step-by-step demonstrations and
hands-on practice.

**Relevance:** Provides a concrete example of an interactive
cryptography education tool.

**Critical source-identity correction:** An earlier uploaded PDF had a
filename referring to *The Design and Use of Interactive Visualization
Applets for Teaching Ciphers*, while NotebookLM later attributed a
similar title to Yamamura, Wang, and Wang with different page details
and cohort statistics. These details do not match the publisher-verified
Abuzaid et al. record. The Yamamura attribution and its claimed cohort
averages/survey percentages have been excluded from the literature
review. They must not be restored unless a separate primary source is
independently identified and checked.

### Source C --- Learning difficulties in abstract algebra

**Reference**

Veith, J. M., Bitzenbauer, P., & Girnat, B. (2022). Exploring learning
difficulties in abstract algebra: The case of group theory. *Education
Sciences, 12*(8), Article 516. https://doi.org/10.3390/educsci12080516

**Stable links:** [Publisher
article](https://www.mdpi.com/2227-7102/12/8/516) ·
[PDF](https://mdpi-res.com/d_attachment/education/education-12-00516/article_deploy/education-12-00516.pdf)

**Contribution to review:** The publisher abstract describes a
pre-test/post-test study involving 143 pre-service teachers, using the
CI²GT concept inventory to investigate conceptual understanding of
introductory group theory and learning difficulties.

**Relevance:** Helps motivate careful explanation of identity, inverse,
composition, and other abstract group concepts in visual learning
materials.

**Limitations:** The study concerns group-theory education, not the
specific cryptographic website. The source analysis notes the absence of
a control group and possible ambiguity in some concept-inventory items.
The Wilcoxon expression previously copied from NotebookLM
(`Z(136) = 147, p < 0.001, r = 0.965`) was not confirmed against the
original results table and is excluded from the review.

## 5. Source-to-claim map

  -------------------------------------------------------------------------------------------------
  Claim intended for paper       Source            What the source       Evidence status / caution
                                                   supports              
  ------------------------------ ----------------- --------------------- --------------------------
  Interactive environments have  Trigui &          Publisher-described   Supported at
  been developed for teaching    Alghazzawi (2012) interactive           publisher-record level; do
  mathematics related to                           environment using     not infer causal learning
  cryptography.                                    modular arithmetic;   gains.
                                                   usability evaluation. 

  Visualization can be used to   Abuzaid et        Publisher record and  Bibliographic record
  demonstrate cryptographic      al. (2011)        paper describe a      verified; avoid
  processes step by step.                          cryptographic         unsupported claims about
                                                   education tool with   effect size or causation.
                                                   interactive visual    
                                                   demonstrations.       

  Introductory group-theory      Veith et          Study of group-theory Supported at
  learning includes conceptual   al. (2022)        conceptual            publisher-abstract level;
  difficulties worth addressing                    understanding and     contextualize design and
  in instructional design.                         reported learning     participant limitations.
                                                   difficulties.         

  Caesar transformations can be  Mathematical      The project's formal  Prove/define in the
  represented as modular shifts. definition used   mathematical model;   mathematical foundations
                                 by project        not a claim that must section and cite an
                                                   be attributed to an   appropriate
                                                   education study.      mathematics/cryptography
                                                                         text if required.

  Affine transformation          Mathematical      Standard              Include a derivation or a
  (E(x)=(ax+b)`\bmod `{=tex}m)   definition used   modular-arithmetic    verified textbook source
  is invertible when             by project        condition for the     in the mathematics
  (`\gcd`{=tex}(a,m)=1).                           affine map to be      section.
                                                   invertible.           

  (S_4) has 24 permutations and  Mathematical      (S_4) is the          Mathematical fact;
  is not itself a standard       definition used   symmetric group on    establish in the
  cipher.                        by project        four elements; order  foundations section.
                                                   (4!=24).              

  The reviewed sources           Synthesis of      Sources address       Interpretive synthesis,
  collectively motivate a        Sources A--C      interactive           not a direct claim made by
  project combining the three                      cryptography and      any single source.
  demonstrations.                                  group-theory learning 
                                                   separately.           

  No existing tool combines      None established  The checked sources   **Do not claim.** State
  these features.                                  do not settle this    only that this combination
                                                   field-wide question.  was not identified in the
                                                                         limited set of sources
                                                                         reviewed.
  -------------------------------------------------------------------------------------------------

## 6. Synthesis and cautious gap statement

The sources cover complementary areas: interactive teaching of
mathematics related to cryptography, a visualization-based cryptographic
education tool, and research on conceptual difficulties in group theory.
Together they provide a rationale for making the mathematical steps of
cryptographic transformations visible and for explaining group
operations explicitly.

The current set of sources does not establish whether another tool
already combines the exact Caesar, Affine, and (S_4)-based
demonstrations planned for this project. This is a possible gap in the
limited set of sources reviewed, not proof of novelty across the field.
A broader search and a documented screening process would be required to
support a stronger novelty claim.

## 7. Research limitations and open checks

1.  **Coverage:** Three sources are used in the revised review. The
    original shortlist contains additional candidates, but they should
    not be described as included evidence until their records and
    relevance are verified.
2.  **Search reproducibility:** Preserve exact search terms, database,
    date searched, inclusion/exclusion decisions, and full-text status
    if the project needs to claim a reproducible or systematic review.
3.  **Primary-source checking:** Exact statistics from Trigui and
    Alghazzawi and Veith et al. were omitted where not checked directly
    against the relevant tables.
4.  **Conflicting record:** Do not cite the Yamamura/Wang/Wang
    attribution or associated cohort statistics based solely on the
    misleading filename or NotebookLM summary.
5.  **Learning outcomes:** The reviewed sources do not prove that the
    current website improves learning.
6.  **Novelty:** No field-wide "first" claim is supported.
7.  **Mathematics sources:** The three sources are not a substitute for
    a standard cryptography or abstract algebra textbook when citing
    formal definitions and proofs.

## 8. Contribution to the final paper

Pavani's literature contribution can inform: - **Introduction and
related work:** contextualize interactive cryptography education and
group-theory learning. - **Algebraic foundations:** identify where
textbook sources are still needed for formal definitions. -
**Comparative analysis:** provide literature context, not mathematical
proof of group properties. - **Discussion and limitations:** caution
against equating usability with learning gains and against unsupported
novelty claims. - **References:** provide verified publisher/DOI records
for the three sources used.

The project lead remains responsible for selecting final claims,
integrating the literature with the mathematical analysis, checking the
required citation style, and ensuring every cited claim is supported.

## 9. Handoff checklist

-   [x] Literature-review draft prepared.
-   [x] Source notes prepared.
-   [x] Reference list prepared with stable publisher/DOI links.
-   [x] Source-to-claim mapping included in this dossier.
-   [x] Conflicting cryptographic-tool attribution excluded.
-   [x] Unverified Wilcoxon expression excluded from the literature
    review.
-   [x] Research gap phrased cautiously.
-   [ ] If exact statistics are required, check each against original
    PDF tables before adding.
-   [ ] Confirm whether the instructor expects 5--8 fully verified
    sources; only three are used in the present review.
-   [ ] Integrate the literature into the final paper and format
    references consistently.

**Handoff status:** The literature-review package is drafted and its
main source-identity risks have been disclosed. It should not be
represented as a systematic review or as containing 5--8 fully verified
sources unless further screening is completed.
