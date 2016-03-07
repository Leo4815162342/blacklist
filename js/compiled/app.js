'use strict';

var App = function ($) {

  // Caching DOM elements
  var $blacklistContainer = $('.blacklist__words'),
      $blacklistWord = $('.blacklist__word'),
      $addWordBtn = $('.blacklist__add-word'),
      $checkAllRevBtn = $('.reviews__check-all'),
      $addReviewBtn = $('.reviews__add'),
      $reviewsContainer = $('.reviews__list');

  // Main vars
  var blacklistWords = ['fuck', 'test', 'lol', 'meth', 'sloth', 'batman'],
      reviews = [{
    text: 'Fuck you Fucking FUCKer!',
    valid: null
  }, {
    text: 'Lorem, test ad asd? Asd ddddd, ss: and dolor ipsum $100 USD!',
    valid: null
  }, {
    text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quo in delectus impedit excepturi voluptatibus eaque, cum, molestias ea, aut accusantium maxime laboriosam animi temporibus commodi illum quisquam unde. Non, inventore.',
    valid: null
  }];

  // HTML template for blacklist word
  function wordHtmlTpl(word) {
    return '<span class="blacklist__word zoomIn animated">\n              ' + word + '<span class="blacklist__remove-icon">x</span>\n            </span>';
  }

  // HTML template for review block
  function reviewHtmlTpl(text) {
    return '<div class="review">\n              <p class="review__text">' + text + '</p>\n              <div class="review__actions">\n                <button class="review__check">check</button>\n                <button class="review__edit"></button>\n                <button class="review__remove">delete</button>\n              </div>\n            </div>';
  }

  // HTML template for filtered word
  function filteredWordTpl(word) {
    return '<span class="review__filtered-word">' + word + '</span>';
  }

  // Function for rendering elements
  function renderElems(elements, template, container) {
    var html = '';
    [].concat(elements).forEach(function (elem) {
      return html += template(elem);
    });
    container.append(html);
  }

  // Retrieving data about review (DOM reference, index, all current reviews)
  function getReviewData(e) {
    var $currentReviews = $('.review'),
        index = arguments.length === 0 || e.type === 'click' ? $(this).closest('.review').index() : e,
        $thisReview = $currentReviews.eq(index);
    return { $currentReviews: $currentReviews, $thisReview: $thisReview, index: index };
  }

  // Splitting review into units and checking if review contains words
  // from blacklistWords array and generating markup (+ checking if the review is valid)
  function getFilteredText(revIndex) {
    var isReviewValid = true,
        text = reviews[revIndex].text.match(/[\s\W+)(]|[^\s\W+)(]+/g).reduce(function (htmlArr, word) {
      var cleanWord = word.toLowerCase();
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
    var args = arguments.length === 0 || e.type === 'click' ? prompt('Please enter a word').replace(/\s/g, '').split(',') : e,
        words = [].concat(args),
        cleanWords = words.map(function (word) {
      var lcWord = word.toLowerCase();
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
    var $currentWords = $('.blacklist__word'),
        args = arguments.length === 0 || e.type === 'click' ? $(this).closest('.blacklist__word').index() : e;
    [].concat(args).map(function (elem) {
      var index = typeof elem === 'number' ? elem : blacklistWords.indexOf(elem.toLowerCase());
      if (index !== -1) {
        return index;
      }
    }).sort(function (a, b) {
      return b - a;
    }).forEach(function (index) {
      blacklistWords.splice(index, 1);
      $currentWords.eq(index).addClass('zoomOut');
      console.log(blacklistWords);
    });
    checkAllReviews();
  }

  // Handling animation of blacklist words
  function handleWordAnimaton(e) {
    var $word = $(this);
    if ($word.hasClass('zoomIn')) {
      $word.removeClass('zoomIn');
    } else {
      $word.remove();
    }
  }

  // Adding and rendering review
  function addReview(e) {
    var text = arguments.length === 0 || e.type === 'click' ? prompt('Please enter review here') : e;
    var reviewObj = {
      text: text,
      valid: null
    };
    reviews.push(reviewObj);
    renderElems(text, reviewHtmlTpl, $reviewsContainer);
  }

  // Rendering the filtered version of review and adding isvalid css class to it
  function checkReview(e) {
    var _getReviewData$call = getReviewData.call(this, e);

    var $thisReview = _getReviewData$call.$thisReview;
    var index = _getReviewData$call.index;
    var $thisReviewText = $thisReview.find('.review__text');
    var curHtml = $thisReviewText.html();
    var newHtml = getFilteredText(index);
    var isValidClass = reviews[index].valid === true ? 'review--valid' : 'review--invalid';
    if (curHtml !== newHtml) {
      $thisReviewText.html(newHtml);
    }
    $thisReview.removeClass('review--valid review--invalid').addClass(isValidClass);
  }

  // Removeing review
  function removeReview(e) {
    var _getReviewData$call2 = getReviewData.call(this, e);

    var $currentReviews = _getReviewData$call2.$currentReviews;
    var index = _getReviewData$call2.index;

    reviews.splice(index, 1);
    $currentReviews.eq(index).remove();
  }

  // Editing a review
  function editReview(e) {
    var $editBtn = $(this);

    var _getReviewData$call3 = getReviewData.call(this, e);

    var $thisReview = _getReviewData$call3.$thisReview;
    var index = _getReviewData$call3.index;
    var $thisReviewText = $thisReview.find('.review__text');
    var reviewIsEdited = $thisReviewText.hasClass('review__text--is-being-edited');
    if (!reviewIsEdited) {
      $editBtn.addClass('review__save');
      $thisReviewText.attr('contenteditable', true).addClass('review__text--is-being-edited').focus();
    } else {
      var newText = $thisReviewText.text();
      $editBtn.removeClass('review__save');
      $thisReviewText.attr('contenteditable', false).removeClass('review__text--is-being-edited');
      reviews[index].text = newText;
      checkReview(index);
    }
  }

  // Checking all reviews
  function checkAllReviews() {
    reviews.forEach(function (review, i) {
      return checkReview(i);
    });
  }

  // Attaching event handlers
  $addWordBtn.on('click', addWord);
  $addReviewBtn.on('click', addReview);
  $checkAllRevBtn.on('click', checkAllReviews);
  $reviewsContainer.on('click', '.review__check', checkReview).on('click', '.review__edit', editReview).on('click', '.review__remove', removeReview);
  $blacklistContainer.on('click', '.blacklist__remove-icon', removeWord).on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', '.blacklist__word', handleWordAnimaton);

  // On init
  renderElems(blacklistWords, wordHtmlTpl, $blacklistContainer);
  renderElems(reviews.map(function (review) {
    return review.text;
  }), reviewHtmlTpl, $reviewsContainer);

  // Public API
  var publicApi = {
    addWord: addWord, // App.addWord('test')
    removeWord: removeWord, // App.removeWord('test') , App.removeWord(0)
    addReview: addReview,
    editReview: editReview,
    checkReview: checkReview,
    removeReview: removeReview,
    checkAllReviews: checkAllReviews
  };

  return publicApi;
}(jQuery);