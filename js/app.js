//events - a super-basic Javascript (publish subscribe) pattern

var events = {
  events: {},
  on: function (eventName, fn) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(fn);
  },
  off: function(eventName, fn) {
    if (this.events[eventName]) {
      for (var i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },
  emit: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(function(fn) {
        fn(data);
      });
    }
  }
};


var App = (function($){
  'use strict';

  // Caching DOM elements
  var $blacklistContainer = $('.blacklist__words'),
      $blacklistWord = $('.blacklist__word'),
      $addWordBtn = $('.blacklist__add-word'),
      $reviewsContainer = $('.reviews');

  // Main vars
  var blacklistWords = ['lorem', 'ipsum'],
      reviews = [
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
    return '<div class="review"><p class="review__text">' + text + '</p><div class="review__actions"><button class="review__check">Check Review</button><button class="review__remove">Remove Review</button></div></div>';
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
    events.emit('wordsArrayChanged', blacklistWords);
  }

  events.on('wordsArrayChanged', fn1);
  events.on('wordsArrayChanged', fn2);

  function fn1(words) {
    console.log(words);
  }

  function fn2(words) {
    alert(words);
  }

  // Removing word from the blacklist and DOM
  function removeWord(arg) {
    var index = (typeof arg === 'number') ? arg : blacklistWords.indexOf(arg),
        $domWords = $('.blacklist__word');
    if (index !== -1) {
      blacklistWords.splice(index, 1);
      $domWords.eq(index).addClass('zoomOut');
    }
  }

  // Adding and rendering review
  function addReview (text) {
    var reviewObj = {
      text: text,
      valid: null
    };
    reviews.push(reviewObj);
    renderElems(reviewObj.text, reviewHtmlTpl, $reviewsContainer);
  }

  function removeReview(index) {
    var $currentReviews = $('.review');
    reviews.splice(index, 1);
    $currentReviews.eq(index).remove();
  }

  // Checking if review containes words from blacklistWords array and generating markup (+ checking if the review is valid)
  function getFilteredText(revIndex) {
    var isReviewValid = true;
    var text = reviews[revIndex].text.match(/[\s\W+)(]|[^\s\W+)(]+/g).reduce(function(htmlArr, word){
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

  // Rendering the filtered version of review and adding isvalid css class to it
  function checkReview(e) {
    var $currentReviews = $('.review'),
        index = (arguments.length === 0 || e.type === 'click') ? $(this).closest($currentReviews).index() : e,
        newHtml = getFilteredText(index),
        $thisReview = $currentReviews.eq(index),
        isValidClass = (reviews[index].valid === true) ? 'review--valid' : 'review--invalid';
    $thisReview
      .find('.review__text')
        .html(newHtml)
      .end()
      .removeClass('review--valid review--invalid')
      .addClass(isValidClass);
  }

  // Checking all reviews
  function checkAllReviews() {
    reviews.forEach(function(r, i){
      checkReview(i);
    });
  }

  // Attaching event handlers
  $addWordBtn.on('click', addWord);
  $reviewsContainer.on('click', '.review__check', checkReview);

  // handler for removing a word with animation 
  $blacklistContainer
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
    removeReview: removeReview,
    checkReview: checkReview,
    checkAllReviews: checkAllReviews
  };

  return publicApi;

})(jQuery);