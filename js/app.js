'use strict';

const App = ($ => {

  // Caching DOM elements
  let $blacklistContainer = $('.blacklist__words'),
      $blacklistWord = $('.blacklist__word'),
      $addWordBtn = $('.blacklist__add-word'),
      $checkAllRevBtn = $('.reviews__check-all'),
      $addReviewBtn = $('.reviews__add'),
      $reviewsContainer = $('.reviews__list');

  // Main vars
  let blacklistWords = ['fuck', 'test', 'lol', 'meth', 'sloth', 'batman'],
      reviews = [
        {
          text: 'Fuck you Fucking FUCKer!',
          valid: null
        },
        {
          text: 'Lorem, test ad asd? Asd ddddd, ss: and dolor ipsum $100 USD!',
          valid: null
        },
        {
          text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo in delectus impedit excepturi voluptatibus eaque, cum, molestias ea, aut accusantium maxime laboriosam animi temporibus commodi illum quisquam unde. Non, inventore.',
          valid: null
        }
    ];

  // HTML template for blacklist word
  function wordHtmlTpl(word) {
    return `<span class="blacklist__word zoomIn animated">
              ${word}<span class="blacklist__remove-icon">x</span>
            </span>`;
  }

  // HTML template for review block
  function reviewHtmlTpl(text) {
    return `<div class="review">
              <p class="review__text">${text}</p>
              <div class="review__actions">
                <button class="review__check">check</button>
                <button class="review__edit"></button>
                <button class="review__remove">delete</button>
              </div>
            </div>`;
  }

  // HTML template for filtered word
  function filteredWordTpl(word) {
    return `<span class="review__filtered-word">${word}</span>`;
  }

  // Function for rendering elements
  function renderElems(elements, template, container) {
    let html = '';
    [].concat(elements).forEach(elem => html += template(elem));
    container.append(html);
  }

  // Retrieving data about review (DOM reference, index, all current reviews)
  function getReviewData(e) {
    let $currentReviews = $('.review'),
        index = (arguments.length === 0 || e.type === 'click') ? $(this).closest('.review').index() : e,
        $thisReview = $currentReviews.eq(index);
    return {$currentReviews, $thisReview, index};
  }

  // Splitting review into units and checking if review contains words
  // from blacklistWords array and generating markup (+ checking if the review is valid)
  function getFilteredText(revIndex) {
    let isReviewValid = true,
        text = reviews[revIndex].text.match(/[\s\W+)(]|[^\s\W+)(]+/g).reduce((htmlArr, word) => {
      let cleanWord = word.toLowerCase();
      if (blacklistWords.indexOf(cleanWord) !== -1) {
        isReviewValid = false;
        htmlArr.push(filteredWordTpl(word));
      } else {
          htmlArr.push(word);
      }
      return htmlArr;
    }, []);
    reviews[revIndex].valid = isReviewValid;
    return text.join('');
  }

  // Adding word to the blacklist array and rendering it on the page
  function addWord(e) {
    let args = (arguments.length === 0 || e.type === 'click') ? prompt('Please enter a word').replace(/\s/g, '').split(',') : e,
        words = [].concat(args),
    cleanWords = words.map(word => {
      let lcWord = word.toLowerCase();
      if (lcWord !== '' && blacklistWords.indexOf(lcWord) === -1) {
        blacklistWords.push(lcWord);
        return lcWord;
      }
    });
    renderElems(cleanWords, wordHtmlTpl, $blacklistContainer);
    checkAllReviews();
  }

  // Removing word from the blacklist and DOM
  function removeWord(e) {
    let $currentWords = $('.blacklist__word'),
        args = (arguments.length === 0 || e.type === 'click') ? $(this).closest('.blacklist__word').index() : e;
    [].concat(args)
    .map(elem => {
      let index = typeof elem === 'number' ? elem : blacklistWords.indexOf(elem.toLowerCase());
      if (index !== -1) {
        return index;
      }
    })
    .sort((a, b) => b - a)
    .forEach(index => {
      blacklistWords.splice(index, 1);
      $currentWords.eq(index).addClass('zoomOut');
      console.log(blacklistWords);
    });
    checkAllReviews();
  }

  // Handling animation of blacklist words
  function handleWordAnimaton(e) {
    let $word = $(this);
    if ($word.hasClass('zoomIn')) {
      $word.removeClass('zoomIn');
    } else {
      $word.remove();
    }
  }

  // Adding and rendering review
  function addReview(e) {
    let text = (arguments.length === 0 || e.type === 'click') ? prompt('Please enter review here') : e;
    let reviewObj = {
      text: text,
      valid: null
    };
    reviews.push(reviewObj);
    renderElems(text, reviewHtmlTpl, $reviewsContainer);
  }

  // Rendering the filtered version of review and adding isvalid css class to it
  function checkReview(e) {
    let {$thisReview, index} = getReviewData.call(this, e),
        $thisReviewText = $thisReview.find('.review__text'),
        curHtml = $thisReviewText.html(),
        newHtml = getFilteredText(index),
        isValidClass = (reviews[index].valid === true) ? 'review--valid' : 'review--invalid';
    if (curHtml !== newHtml) {
      $thisReviewText.html(newHtml);
    }
    $thisReview.removeClass('review--valid review--invalid').addClass(isValidClass);
  }

  // Removeing review
  function removeReview(e) {
    let {$currentReviews, index} = getReviewData.call(this, e);
    reviews.splice(index, 1);
    $currentReviews.eq(index).remove();
  }

  // Editing a review
  function editReview(e) {
    let $editBtn = $(this),
        {$thisReview, index} = getReviewData.call(this, e),
        $thisReviewText = $thisReview.find('.review__text'),
        reviewIsEdited = $thisReviewText.hasClass('review__text--is-being-edited');
    if (!reviewIsEdited) {
      $editBtn.addClass('review__save');
      $thisReviewText.attr('contenteditable', true).addClass('review__text--is-being-edited').focus();
    } else {
      let newText = $thisReviewText.text();
      $editBtn.removeClass('review__save');
      $thisReviewText.attr('contenteditable', false).removeClass('review__text--is-being-edited');
      reviews[index].text = newText;
      checkReview(index);
    }
  }

  // Checking all reviews
  function checkAllReviews() {
    reviews.forEach((review, i) => checkReview(i));
  }

  // Attaching event handlers
  $addWordBtn.on('click', addWord);
  $addReviewBtn.on('click', addReview);
  $checkAllRevBtn.on('click', checkAllReviews);
  $reviewsContainer.on('click', '.review__check', checkReview)
                   .on('click', '.review__edit', editReview)
                   .on('click', '.review__remove', removeReview);
  $blacklistContainer.on('click', '.blacklist__remove-icon', removeWord)
  .on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', '.blacklist__word', handleWordAnimaton);

  // On init
  renderElems(blacklistWords, wordHtmlTpl, $blacklistContainer);
  renderElems(reviews.map(review => review.text), reviewHtmlTpl, $reviewsContainer);

  // Public API
  let publicApi = {
    addWord,                    // App.addWord('test')
    removeWord,              // App.removeWord('test') , App.removeWord(0)
    addReview,
    editReview,
    checkReview,
    removeReview,
    checkAllReviews
  };

  return publicApi;

})(jQuery);