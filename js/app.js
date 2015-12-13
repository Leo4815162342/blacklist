var App = (function($){
  'use strict';

  // Caching DOM elements
  var $blacklistContainer = $('.blacklist__words'),
      $blacklistWord = $('.blacklist__word'),
      $addWordBtn = $('.blacklist__add-word'),
      $checkAllRevBtn = $('.reviews__check-all'),
      $addReviewBtn = $('.reviews__add'),
      $reviewsContainer = $('.reviews__list');

  // Main vars
  var blacklistWords = ['lorem', 'ipsum', 'test', 'fuck'],
      reviews = [
        {
          text: 'Fucking! awesome a b c',
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
  
  // On init
  renderElems(blacklistWords, wordHtmlTpl, $blacklistContainer);
  renderElems(reviews.map(function(i){return i.text;}), reviewHtmlTpl, $reviewsContainer);

  // HTML template for blacklist word
  function wordHtmlTpl(word) {
    return '<span class="blacklist__word zoomIn animated">' + word + '<span class="blacklist__remove-icon">x</span></span>';
  }

  // HTML template for review block
  function reviewHtmlTpl(text) {
    return '<div class="review"><p class="review__text">' + text + '</p><div class="review__actions"><button class="review__check">check</button><button class="review__edit">edit</button><button class="review__remove">remove</button></div></div>';
  }

  // HTML template for filtered word
  function filteredWordTpl(word) {
    return '<span class="review__filtered-word">' + word + '</span>';
  }

  // Function for rendering elements
  function renderElems(elements, templateFn, container) {
    var html = '';
    if (Array.isArray(elements)) {
      elements.forEach(function(i){
        html += templateFn(i);
      });
    } else {
      html = templateFn(elements);
    }
    container.append(html);
  }

  // Adding word to the blacklist array and rendering it on the page
  function addWord(e) {
    var word = (arguments.length === 0 || e.type === 'click') ? prompt('Please enter a word') : e;
    if (word !== '' && word !== null && blacklistWords.indexOf(word) === -1) {
      word = word.toLowerCase();
      blacklistWords.push(word);
      renderElems(word, wordHtmlTpl, $blacklistContainer);
    }
  }

  // Removing word from the blacklist and DOM
  function removeWord(arg) {
    var index = (typeof arg === 'number') ? arg : blacklistWords.indexOf(arg),
        $currentWords = $('.blacklist__word');
    if (index !== -1) {
      blacklistWords.splice(index, 1);
      $currentWords.eq(index).addClass('zoomOut');
    }
  }

  // Adding and rendering review
  function addReview(e) {
    var text = (arguments.length === 0 || e.type === 'click') ? prompt('Please enter review here') : e;
    var reviewObj = {
      text: text,
      valid: null
    };
    reviews.push(reviewObj);
    renderElems(reviewObj.text, reviewHtmlTpl, $reviewsContainer);
  }

  // Removeing review
  function removeReview(e) {
    var thisReviewObj = getReviewData.call(this, e),
        $currentReviews = thisReviewObj.currentReviews,
        $thisReview = thisReviewObj.thisReview,
        index = thisReviewObj.index;
    reviews.splice(index, 1);
    $currentReviews.eq(index).remove();
  }

  // Splitting review into units. Checking if review containes words from blacklistWords array and generating markup (+ checking if the review is valid)
  function getFilteredText(revIndex) {
    var isReviewValid = true,
        text = reviews[revIndex].text.match(/[\s\W+)(]|[^\s\W+)(]+/g).reduce(function(htmlArr, word){
      var cleanWord = word.toLowerCase();
      if (blacklistWords.indexOf(cleanWord) !== -1) {
        isReviewValid = false;
        htmlArr.push(filteredWordTpl(word));
      } else {
        var flag = true;
        for (var i = 0, n = blacklistWords.length; i < n; i++) {
          if (cleanWord.indexOf(blacklistWords[i]) !== -1) {
            isReviewValid = false;
            flag = false;
            htmlArr.push(filteredWordTpl(word));
          }
        }
        if (flag) {
          htmlArr.push(word);
        }
      }
      return htmlArr;
    }, []);
    reviews[revIndex].valid = isReviewValid;
    return text.join('');
  }

  // Rendering the filtered version of review and adding isvalid css class to it
  function checkReview(e) {
    var thisReviewObj = getReviewData.call(this, e),
        $thisReview = thisReviewObj.thisReview,
        index = thisReviewObj.index,
        newHtml = getFilteredText(index),
        isValidClass = (reviews[index].valid === true) ? 'review--valid' : 'review--invalid';
    $thisReview
      .find('.review__text')
        .html(newHtml)
      .end()
      .removeClass('review--valid review--invalid')
      .addClass(isValidClass);
  }

  // Editing a review
  function editReview(e) {
    var thisReviewObj = getReviewData.call(this, e),
        $thisReview = thisReviewObj.thisReview,
        index = thisReviewObj.index,
        $thisReviewText = $thisReview.find('.review__text');
    $thisReviewText.replaceWith($('<textarea/>').append(reviews[index].text));
  }

  // Retrieving data about review (DOM reference, index, all current reviews)
  function getReviewData(e) {
    var $currentReviews = $('.review'),
        index = (arguments.length === 0 || e.type === 'click') ? $(this).closest('.review').index() : e,
        $thisReview = $currentReviews.eq(index);
    return {
      currentReviews: $currentReviews,
      thisReview: $thisReview,
      index: index
    };
  }

  // Checking all reviews
  function checkAllReviews() {
    reviews.forEach(function(r, i){
      checkReview(i);
    });
  }

  // Attaching event handlers
  $addWordBtn.on('click', addWord);
  $addReviewBtn.on('click', addReview);
  $checkAllRevBtn.on('click', checkAllReviews);
  $reviewsContainer.on('click', '.review__check', checkReview)
                   .on('click', '.review__edit', editReview)
                   .on('click', '.review__remove', removeReview);
  
  // handler for removing a word with animation 
  $blacklistContainer
  // on animation end adding/removing appropriate class
  .on('webkitAnimationEnd oanimationend oAnimationEnd msAnimationEnd animationend', '.blacklist__word', function(){
    var $word = $(this);
    if ($word.hasClass('zoomIn')) {
      $word.removeClass('zoomIn');
    } else {
      $word.remove();
    }
  })
  .on('click', '.blacklist__remove-icon', function(){
    var index = $(this).parent('.blacklist__word').index();
    removeWord(index);
  });

  // Public API
  var publicApi = {
    addWord: addWord,
    removeWord: removeWord,
    addReview: addReview,
    editReview: editReview,
    checkReview: checkReview,
    removeReview: removeReview,
    checkAllReviews: checkAllReviews
  };

  return publicApi;

})(jQuery);