const apiKey = '5d576382955ff5829fc3844390db4427';
const baseAPIUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;

//Define global varibale clickCount that will be updated when Go! button is clicked
var clickCount = 0;

$(function() {
  //After the DOM has loaded, call afterGoClicked any time the button is clicked
  //If button is clicked more than once update the movies automatically when the year, genre and certification is updated
  $('#button').click(function() {
    afterGoClicked();
    if (clickCount >= 1) {
      $('#year').change(afterGoClicked);
      $('#genre').change(afterGoClicked);
      $('#certification').change(afterGoClicked);
    }
  });

  //Loop through the children in the movies division and call the function afterMovieClicked if the input is clicked
  $('#movies')
    .children()
    .each(function(index) {
      $('#movieImg' + index).click(afterMovieClicked);
    });
});

function afterGoClicked() {
  // Read the selected genre id from the select boxes and save it to a variable
  var genre = $('#genre').val();
  // Read the entered year from the text box and save it to a variable
  var year = $('#year').val();
  //Creat a date variable that tells us the current date
  var date = new Date();

  //If data is not between 1900 and the current year then we create an alert to enter a valid year
  if (!(year >= 1900 && year <= date.getFullYear())) {
    alert(`Please enter a valid year between 1900 and ${date.getFullYear()}`);
  }

  //Read the entered rating and save it to a variable
  var certification = $('#certification').val();

  // Call buildQueryString to handle building a completeUrl
  var completeUrl = buildQueryString(baseAPIUrl, genre, year, certification);

  // Load the JSON from the API with completeUrl, and then call the afterDataLoaded function
  $.getJSON(completeUrl, afterDataLoaded);

  //Add one to clickCount
  clickCount = clickCount + 1;
}

//Combine the baseUrl, genre, and year together to create a complete url with the
//right query parameters. Then return the url.

function buildQueryString(baseUrl, genre, year, certification) {
  return (
    baseUrl +
    '&primary_release_year=' +
    year +
    '&with_genres=' +
    genre +
    '&certification_country=US&certification=' +
    certification
  );
}

// Call this function with the data object that comes back from getJSON
function afterDataLoaded(dataObject) {
  var results = dataObject.results;
  console.log(results[0]['title']);
  var posterBaseUrl = 'https://image.tmdb.org/t/p/w500';
  var imagePlaceHolder =
    'http://freedesignfile.com/upload/2014/12/Popcorn-with-film-elements-vector-background-01.jpg';

  //Find the length of the movies div and save it to a variable
  var movies = document.getElementById('movies');
  var moviesLength = movies.getElementsByTagName('input').length;

  //If the length of results is less than the length of movies (10) then hide all the images that
  //do not have any results by setting the hidden attribute of those elements to true
  if (results.length < moviesLength) {
    var newMovies = document.getElementById('movies');
    var newMoviesLength = newMovies.getElementsByTagName('input').length;
    for (i = results.length; i < newMoviesLength; i++) {
      $('#movieImg' + i).attr('hidden', true);
    }
  }

  //If the length of results is greater than that of movies then set the hidden attribute to false
  if (results.length >= moviesLength) {
    for (i = 0; i < moviesLength; i++) {
      $('#movieImg' + i).attr('hidden', false);
    }
  }

  //Loop through the results object. If the poster path value is null then then set the src atrribute to
  //the image place holder variable. Otherwise set the src attribute to posterBaseUrl + result.poster_path.
  //Aslo, add the movieID attribute for every movie so that we can create a new API query using the movieID in order to get the imdb_id

  results.forEach(
    (result, index) =>
      result.poster_path === null
        ? $('#movieImg' + index)
            .attr('src', imagePlaceHolder)
            .attr('movieID', result.id)
        : $('#movieImg' + index)
            .attr('src', posterBaseUrl + result.poster_path)
            .attr('movieID', result.id)
  );
}

//Use the movieId we added in the afteDataLoaded function to build a second url with the right
//query parameters that will find all the data for that specific movie

function buildSecondQueryString(movieId) {
  return (
    'https://api.themoviedb.org/3/movie/' +
    movieId +
    '?api_key=5d576382955ff5829fc3844390db4427'
  );
}

//The target property gets the element on which the event originally occurred (image that was clicked)
//Then we build the movieUrl using the movieId that we just retrieved.
//We then load the JSON using the movieUrl and then create a callback function that retrieves the imdb_id of the movie and
//creates a window location for that specific image/movie.

function afterMovieClicked(event) {
  console.log(event.target);
  var movieId = event.target.getAttribute('movieID');
  var movieUrl = buildSecondQueryString(movieId);
  $.getJSON(movieUrl, function(dataObject) {
    var imdbId = dataObject.imdb_id;
    window.location = 'https://www.imdb.com/title/' + imdbId;
  });
}
