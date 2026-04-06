const questionListEl = document.getElementById("questionList");
const statusEl = document.getElementById("status");
const searchEl = document.getElementById("search");
const expandAllBtn = document.getElementById("expandAll");
const collapseAllBtn = document.getElementById("collapseAll");

const embeddedFallback = `A. AND-OR Construction
Hint 1: Recall the bitwise property (x & y) | (x ^ y) = x | y. Every bit in 'a' must be present in 'b'.
Hint 2: If 'a' is a submask of 'b', you can simply use x = a and y = b.
Solution: If (a & b) == a, output "a b". Otherwise, output -1.

B. Three Programmers
Hint 1: To maximize equal elements, you must target an existing value a[i] where b[i] = 1.
Hint 2: Sort the array and use a sliding window (two pointers) to find the largest range that can be increased to a[i] within budget k.
Solution: Sort a and b. For each i where b[i]=1, find the largest window [j, i] such that the cost to raise all a[k] (where b[k]=1) to a[i] is <= k. Output the max (i - j + 1).

C. Optimal Data Transmission
Hint 1: The operation a[i] % x can change a[i] to any value in the range [0, (a[i]-1)/2].
Hint 2: Work backwards from n to 1. If a[i] >= a[i+1], you must reduce a[i] to the largest possible value < a[i+1].
Solution: Iterate i from n-1 down to 1. If a[i] >= a[i+1], set a[i] = (a[i]-1)/2. If still a[i] >= a[i+1] or a[i] < 0, output -1.

D. The War Hammer's Defense
Hint 1: A sequence of N unique numbers can have at most ceil(N/2) peaks.
Hint 2: Place the M largest numbers at alternating positions (1, 3, 5...) to act as peaks, then fill the gaps with remaining numbers in increasing order.
Solution: If M > ceil(N/2) or M < 1, output -1. Sort A, place the M largest elements at odd indices, and fill the rest in ascending order.

E. Echoes of the Original
Hint 1: The problem asks for the number of distinct permutations of the characters in string S.
Solution: Use the formula: n! / (count(char1)! * count(char2)! * ...). Output the result modulo 10^9 + 7.

F. Power-of-Two Pairs
Hint 1: The condition (a[i] ^ a[j]) = 2^k means a[j] = a[i] ^ 2^k.
Hint 2: For each number, check all 31 possible powers of two by XORing and checking a frequency map.
Solution: Use a map to store frequencies. For each a[i], iterate k from 0 to 30, add map[a[i] ^ (1<<k)] to total, then increment map[a[i]].

G. InShayar and the Pewast Ellipses
Hint 1: To minimize increments, sort the 2n integers and treat them as n pairs (a[i], b[i]).
Hint 2: Ensure each pair (a[i], b[i]) is strictly greater than the previous pair (a[i-1], b[i-1]).
Solution: Sort the 2n integers. For each pair at (2i, 2i+1), increment them to be at least (last_a + 1) and (last_b + 1). Sum the total increments.

H. The Counting of the Void
Hint 1: The total MEX sum is minimized when 0 and 1 are placed at opposite ends of the permutation.
Solution: The number of such permutations is 2 * (n - 2)! modulo 10^9 + 7.

I. The Bet
Hint 1: Gon can reach position c if and only if c is a multiple of the greatest common divisor of x and y.
Solution: If c % gcd(x, y) == 0, output YES. Otherwise, output NO.

J. The Swordsmith Village Siege
Hint 1: Pick the K smallest Slayers and the K smallest Demons.
Hint 2: To minimize the maximum sum, pair the smallest Slayer with the largest Demon (within the chosen K).
Solution: Sort S and T. Take the first K of each. Output max(S[i] + T[K-1-i]) for i from 0 to K-1.

K. Synchronizing TARS
Hint 1: Convert the total Earth time (H, M, S) into total Earth seconds first.
Solution: TotalSec = H*3600 + M*60 + S. LocalS = TotalSec % Sp, LocalM = (TotalSec / Sp) % Mp, LocalH = (TotalSec / (Sp * Mp)) % Hp.

L. Hawkeye's Glance
Hint 1: Use the squared distance D^2 = x^2 + y^2 to avoid precision issues with square roots.
Hint 2: Use binary search (upper_bound) on the sorted squared radii to find the largest ring R_hit.
Solution: For each arrow, find index i such that r[i]^2 is the largest value <= x^2 + y^2. Score = r[n] - r[i].

M. AND-OR Pair Counting
Hint 1: If (a & b) != a, then no such pair exists because a must be a submask of b.
Hint 2: For every bit where a is 0 and b is 1, you have 2 choices (x=0, y=1 or x=1, y=0).
Solution: If (a & b) != a, output 0. Otherwise, output 2^(number of set bits in (a ^ b)).`;

if (window.marked) {
  window.marked.setOptions({
    breaks: true,
    gfm: true,
  });
}

function parseQuestions(rawText) {
  const lines = rawText.replace(/\r\n/g, "\n").split("\n");
  const questions = [];
  let current = null;
  let activeSection = null;

  function pushCurrentQuestion() {
    if (!current) {
      return;
    }

    const solution = current.solutionLines.join("\n").trim();
    questions.push({
      code: current.code,
      title: current.title,
      hints: current.hints,
      solution,
    });
  }

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line) {
      activeSection = null;
      continue;
    }

    if (/^[-=]{3,}$/.test(line)) {
      continue;
    }

    const headerMatch = line.match(/^([A-Z])\.\s+(.+)$/);
    if (headerMatch) {
      pushCurrentQuestion();
      current = {
        code: headerMatch[1],
        title: headerMatch[2],
        hints: [],
        solutionLines: [],
      };
      activeSection = null;
      continue;
    }

    if (!current) {
      continue;
    }

    const hintMatch = line.match(/^Hint\s*\d*\s*:\s*(.+)$/i);
    if (hintMatch) {
      current.hints.push(hintMatch[1].trim());
      activeSection = "hint";
      continue;
    }

    const solutionMatch = line.match(/^(?:Detailed\s+)?Solution\s*:\s*(.*)$/i);
    if (solutionMatch) {
      if (solutionMatch[1].trim()) {
        current.solutionLines.push(solutionMatch[1].trim());
      }
      activeSection = "solution";
      continue;
    }

    if (activeSection === "hint" && current.hints.length > 0) {
      current.hints[current.hints.length - 1] += "\n" + line;
      continue;
    }

    if (activeSection === "solution") {
      current.solutionLines.push(line);
    }
  }

  pushCurrentQuestion();
  return questions;
}

function buildHintsMarkdown(hints) {
  if (!hints.length) {
    return "_No hints available._";
  }

  return hints.map((hint) => hint.trim());
}

function buildSolutionMarkdown(solution) {
  if (!solution) {
    return "_No solution available._";
  }

  return solution;
}

function setStatus(message, isError = false) {
  if (!statusEl) {
    return;
  }

  statusEl.classList.toggle("error", isError);
  statusEl.textContent = message;
}

function createDetails(title, markdownContent) {
  const details = document.createElement("details");
  details.className = "panel";

  const summary = document.createElement("summary");
  summary.textContent = title;

  const body = document.createElement("div");
  body.className = "markdown";
  body.innerHTML = window.marked.parse(markdownContent);

  details.append(summary, body);
  return details;
}

function createQuestionCard(question, order) {
  const card = document.createElement("article");
  card.className = "question-card";
  card.style.setProperty("--order", String(order));
  card.dataset.searchText = [
    question.code,
    question.title,
    question.hints.join(" "),
    question.solution,
  ]
    .join(" ")
    .toLowerCase();

  const heading = document.createElement("h2");
  heading.textContent = `Question ${question.code}: ${question.title}`;

  const detailsWrap = document.createElement("div");
  detailsWrap.className = "details-wrap";

  const hintBlocks = buildHintsMarkdown(question.hints);
  if (!hintBlocks.length) {
    detailsWrap.append(createDetails("Hint", "_No hints available._"));
  } else {
    hintBlocks.forEach((hint, index) => {
      detailsWrap.append(createDetails(`Hint ${index + 1}`, hint));
    });
  }

  detailsWrap.append(createDetails("Answer / Solution", buildSolutionMarkdown(question.solution)));

  card.append(heading, detailsWrap);
  return card;
}

function renderQuestions(questions) {
  questionListEl.innerHTML = "";

  if (!questions.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No questions could be parsed from ans.txt.";
    questionListEl.append(empty);
    setStatus("Parsed 0 questions from ans.txt.", true);
    return;
  }

  const fragment = document.createDocumentFragment();
  questions.forEach((question, index) => {
    fragment.append(createQuestionCard(question, index));
  });
  questionListEl.append(fragment);

  setStatus(`Loaded ${questions.length} questions from ans.txt.`);

  applyFilter();
}

function applyFilter() {
  const cards = Array.from(questionListEl.querySelectorAll(".question-card"));
  const term = searchEl.value.trim().toLowerCase();

  if (!cards.length) {
    return;
  }

  let visibleCount = 0;
  for (const card of cards) {
    const show = !term || card.dataset.searchText.includes(term);
    card.hidden = !show;
    if (show) {
      visibleCount += 1;
    }
  }

  if (term) {
    setStatus(`Showing ${visibleCount} of ${cards.length} questions.`);
  } else {
    setStatus(`Loaded ${cards.length} questions from ans.txt.`);
  }
}

function setAllPanelsOpen(open) {
  const panels = questionListEl.querySelectorAll("details");
  panels.forEach((panel) => {
    panel.open = open;
  });
}

async function initializePage() {
  let rawText = "";
  let usedFallback = false;

  try {
    setStatus("Loading ans.txt...");
    const response = await fetch("./ans.txt", { cache: "no-store" });
    if (response.ok) {
      rawText = await response.text();
    }
  } catch (error) {
    console.warn("Could not fetch ans.txt directly; using embedded fallback.", error);
  }

  if (!rawText.trim()) {
    rawText = embeddedFallback;
    usedFallback = true;
  }

  const questions = parseQuestions(rawText);
  renderQuestions(questions);

  if (usedFallback) {
    setStatus(
      `Loaded ${questions.length} questions from embedded fallback data (ans.txt fetch unavailable in this view).`
    );
  }
}

searchEl.addEventListener("input", applyFilter);
expandAllBtn.addEventListener("click", () => setAllPanelsOpen(true));
collapseAllBtn.addEventListener("click", () => setAllPanelsOpen(false));

initializePage();
