var YT_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';
var state = {
  nextPage: '',
  prevPage: '',
  lastQ: '',
  channel: '',
}

function updatePageTokens(state, nextPage, prevPage){
  state.nextPage = nextPage;
  state.prevPage = prevPage;
}

function updateLastQ(state, q){
  state.lastQ = q;
}

function updateChannel(state, channel){
  state.channel = channel;
}

function getChannel(state, channel){
  return state.channel;
}

function getPrevPage(state){
  return state.prevPage;
}

function getNextPage(state){
  return state.nextPage;
}

function getLastQ(state){
  return state.lastQ;
}

function getFromYoutube(searchTerm, callback, pageToken, channel) {
  var query = {
    q: searchTerm,
    part: 'snippet',
    key: 'AIzaSyAv_MPsL7eE6BBbyzpCuR5wu1eHWv4-hyU',
    type: 'video',
    maxResults: 6,
    pageToken: pageToken,
  }

  if (channel){
    query.channelId = channel;
  }
  $.getJSON(YT_BASE_URL, query, callback);
}

function processData(data) {
  var itemTemplate = (
    '<div class="result">' +
      '<a href="#" class="js-lightbox"><img></a>' +
    '</div>'
  );
  
  var resultsHTML = "<p>No results</p>";

  if(data.items.length > 0){
    resultsHTML = data.items.map(function(item){
      var itemHTML = $(itemTemplate);
      itemHTML.find('img').attr('src', item.snippet.thumbnails.medium.url);
      itemHTML.find('a').attr('data-vid-id', item.id.videoId).attr('data-channel-id', item.snippet.channelId).attr('data-channel-name', item.snippet.channelTitle);
      return itemHTML;
    });
  }

  updatePageTokens(state, data.nextPageToken, data.prevPageToken);

  $('main').html(resultsHTML);
}

function showLightBox(id, channelId, channelName){
  console.log('https://www.youtube.com/embed/' + id);
  $('.lightbox').find('iframe').attr('src', 'https://www.youtube.com/embed/' + id);
  $('.lightbox').find('a').attr('data-channel-id', channelId);
  $('.lightbox').find('a').attr('data-channel-name', channelName);
  $('.lightbox').removeClass('hidden');
}

function hideLightBox(){
  $('.lightbox').find('iframe').attr('src', '');
  $('.lightbox').addClass('hidden');
}

function addChannelToSeachBar(channelName){
  $('.js-q').val('');
  $('.js-q').attr('placeholder', 'Browsing Channel: ' + channelName);
}

$(function(){

  $('.js-search').submit(function(e) {
    e.preventDefault();
    var query = $(this).find('.js-q').val();
    getFromYoutube(query, processData);
    updateLastQ(state, query);
  });

  $('.js-next').click(function(e) {
    e.preventDefault();
    var query = getLastQ(state);
    var token = getNextPage(state);
    var channel = getChannel(state);

    getFromYoutube(query, processData, token, channel);
  });

  $('.js-prev').click(function(e) {
    e.preventDefault();
    var query = getLastQ(state);
    var token = getPrevPage(state);
    getFromYoutube(query, processData, token, channel);
  });

  $('.js-channel-link').click(function(e) {
    e.preventDefault();
    var channelId = $(this).attr('data-channel-id');
    var channelName = $(this).attr('data-channel-name');

    getFromYoutube("", processData, "", channelId);
    updateChannel(state, channelId);
    addChannelToSeachBar(channelName);
  });

  $('main').on('click', '.js-lightbox', function(e){
    e.preventDefault();
    var id = $(this).attr('data-vid-id');
    var channelId = $(this).attr('data-channel-id');
    var channelName = $(this).attr('data-channel-name');

    showLightBox(id, channelId, channelName);
  });

  $('body').on('click', '.lightbox', function(e){
    hideLightBox();
  });

  $(document).keyup(function(e) {
    if (e.keyCode === 27) hideLightBox();   // esc
  });

});
