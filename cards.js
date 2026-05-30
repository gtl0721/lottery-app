(function () {
  const CARDS_PER_PAGE = 8;
  const DRAW_DATE = "2026-06-14";
  const cardsRoot = document.querySelector("#cardsRoot");
  const cardCount = document.querySelector("#cardCount");
  const cards = Array.isArray(window.weddingLotteryCards) ? window.weddingLotteryCards : [];

  function padNumber(number) {
    return String(number).padStart(2, "0");
  }

  function createNumberBall(number) {
    const ball = document.createElement("span");
    ball.className = "number-ball";
    ball.textContent = padNumber(number);
    return ball;
  }

  function createCard(card) {
    const article = document.createElement("article");
    article.className = "lottery-card";

    const badge = document.createElement("p");
    badge.className = "card-badge";
    badge.textContent = `No. ${String(card.id).padStart(3, "0")}`;

    const title = document.createElement("h2");
    title.textContent = "婚禮大樂透";

    const subtitle = document.createElement("p");
    subtitle.className = "card-subtitle";
    subtitle.textContent = "Timmy & Emily Wedding Lottery";

    const numberList = document.createElement("div");
    numberList.className = "number-list";
    card.numbers.forEach((number) => {
      numberList.appendChild(createNumberBall(number));
    });

    const date = document.createElement("p");
    date.className = "draw-date";
    date.textContent = `開獎時間 ${DRAW_DATE}`;

    article.append(badge, title, subtitle, numberList, date);
    return article;
  }

  function createPage(pageCards) {
    const page = document.createElement("section");
    page.className = "print-page";
    pageCards.forEach((card) => {
      page.appendChild(createCard(card));
    });
    return page;
  }

  function renderCards() {
    cardsRoot.textContent = "";

    for (let index = 0; index < cards.length; index += CARDS_PER_PAGE) {
      cardsRoot.appendChild(createPage(cards.slice(index, index + CARDS_PER_PAGE)));
    }

    cardCount.textContent = `共 ${cards.length} 張，每頁 8 張 A7 卡`;
  }

  renderCards();
})();
