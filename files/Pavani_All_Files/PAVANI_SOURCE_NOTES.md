# Pavani --- Verified Source Notes

**Project:** *Cryptography Through Abstract Algebra: An Interactive
Study of Three Transformation Systems*

## Evidence standard

This version separates publisher-verified bibliographic information from
numerical details previously copied from a NotebookLM report. Where a
numerical result could not be confidently verified against the original
article text, it is omitted from the literature review rather than
guessed. These notes support a cautious literature review; they do not
establish a field-wide novelty claim.

## Source 1 --- Trigui and Alghazzawi (2012)

### Bibliographic record

Trigui, M. S., & Alghazzawi, D. M. (2012). Learning the related
mathematics to cryptography by interactive way. *International Journal
of Modern Education and Computer Science, 4*(2), 8--14.
https://doi.org/10.5815/ijmecs.2012.02.02

-   Publisher article:
    https://www.mecs-press.org/ijmecs/ijmecs-v4-n2/v4n2-2.html
-   Full-text PDF:
    https://www.mecs-press.org/ijmecs/ijmecs-v4-n2/IJMECS-V4-N2-2.pdf

### Publisher-confirmed scope

The publisher describes an online interactive tool using modular
arithmetic in a virtual learning environment. A case study was conducted
with students at King Abdulaziz University. The publisher abstract says
the evaluation indicated good usability in terms of learnability,
usefulness, ease of use, and outcome.

### Relevance

This source supports discussion of interactive tools for teaching
mathematics related to cryptography, especially modular arithmetic.

### Limitations and citation guidance

The publisher abstract does not by itself establish objective learning
gains or causal effects. Do not describe the study as a controlled
experiment unless the full paper supports that characterization. Do not
reproduce the exact Cronbach alpha values, means, or p-values from the
earlier NotebookLM summary until they have been checked against the
paper's tables and methods. Those figures are intentionally excluded
from the final literature review.

------------------------------------------------------------------------

## Source 2 --- Abuzaid et al. (2011), cryptographic education tool

### Publisher-verified bibliographic record

Abuzaid, A., Yuan, X., Yu, H., & Chu, B. (2011). The design and
implementation of a cryptographic education tool. In *Proceedings of the
3rd International Conference on Computer Supported Education (CSEDU
2011)* (Vol. 1, pp. 193--198). SciTePress.
https://doi.org/10.5220/0003301301930198

-   Publisher record: https://www.scitepress.org/Papers/2011/33013/
-   Full-text PDF:
    https://www.scitepress.org/PublishedPapers/2011/33013/pdf/index.html
-   DOI: https://doi.org/10.5220/0003301301930198

### Publisher/PDF-confirmed scope

The publisher record confirms the title, authors, proceedings, year,
pages, and DOI. The paper describes a Cryptographic Education Tool
intended to let students explore cryptographic algorithms and processes,
including key generation, encryption, and decryption. The accessible
paper text describes a visualization-based interactive tutorial with
step-by-step demonstrations and hands-on practice.

### Critical identity correction

The earlier NotebookLM report attributed a similarly titled
cryptographic education paper to Yamamura, Wang, and Wang, with
different page details and cohort statistics. Those details do not match
the publisher-verified SciTePress record above. Therefore, the Yamamura
attribution and its claimed exam averages/survey percentages have been
removed from the review. Do not cite those statistics unless a separate,
identifiable primary source is found and checked.

### Relevance and limitations

This source is relevant to interactive cryptography demonstrations. Do
not infer causal learning effects from positive student feedback alone.
Any detailed experimental claim must be checked in the original paper
and represented with the study's design limitations.

------------------------------------------------------------------------

## Source 3 --- Veith, Bitzenbauer, and Girnat (2022)

### Bibliographic record

Veith, J. M., Bitzenbauer, P., & Girnat, B. (2022). Exploring learning
difficulties in abstract algebra: The case of group theory. *Education
Sciences, 12*(8), Article 516. https://doi.org/10.3390/educsci12080516

-   Publisher article: https://www.mdpi.com/2227-7102/12/8/516
-   Full-text PDF:
    https://mdpi-res.com/d_attachment/education/education-12-00516/article_deploy/education-12-00516.pdf

### Publisher-confirmed scope

The publisher abstract describes a pre-test/post-test study involving
143 pre-service teachers, using the CI²GT concept inventory to
investigate conceptual understanding of introductory group theory. The
article discusses recurring learning difficulties and learning gains in
sub-domains of group theory.

### Relevance

This source supports discussion of conceptual difficulties in
introductory group theory and the importance of explaining formal
structures clearly.

### Limitations and citation guidance

The study is about group-theory education, not the specific
cryptographic website in this project. The source analysis reports no
control group and notes possible ambiguity in some concept-inventory
distractors; describe findings within that context. The previously
copied Wilcoxon expression `Z(136) = 147, p < 0.001, r = 0.965` has not
been independently confirmed in the primary article table and is omitted
from the literature review. Do not quote it until checked against the
original table.

------------------------------------------------------------------------

## Cross-source synthesis

The two cryptography-education sources concern interactive tools for
mathematics related to cryptography and step-by-step cryptographic
demonstrations. Veith et al. examine learning difficulties in group
theory. Together, they provide context for a project that presents
classical transformations alongside abstract algebra concepts.

The sources reviewed do not, on the evidence checked here, establish
whether another tool already combines the project's exact examples.
State this only as a possible gap in the limited set of sources
reviewed, not as proof that the project is the first of its kind.

## Mathematical accuracy notes

-   Caesar encryption can be expressed as an additive shift modulo the
    alphabet size.
-   An Affine cipher is commonly expressed as `E(x) = (ax + b) mod m`.
    It is invertible when `gcd(a, m) = 1`.
-   `S4` is the symmetric group on four elements and contains 24
    permutations. It is an algebraic structure, not by itself a standard
    encryption algorithm.
-   Do not claim every element of `S4` is a valid key for a particular
    cipher unless the project defines the encoding and transformation
    scheme.

## Final verification record

-   [x] Trigui and Alghazzawi: publisher record, DOI, scope, and page
    range confirmed.
-   [x] Abuzaid et al.: publisher record, authors, DOI, proceedings
    volume, and page range confirmed.
-   [x] Veith et al.: publisher record, authors, DOI, and article number
    confirmed.
-   [x] Removed unresolved Yamamura attribution and unverified cohort
    statistics from the literature review.
-   [x] Removed the unverified Wilcoxon expression from the literature
    review.
-   [ ] If exact numerical findings are needed for the final report,
    compare each value directly with the relevant original PDF/table
    before adding it.
