import config  from './config';
import Request from './request';

var request = new Request(config.ConsumerKey, config.ConsumerSecret);

var resultsContainer = document.querySelector('.results');
var searchBtn        = document.querySelector('.search-btn');
var searchInput      = document.querySelector('.search-input');

var search = {
  handleError(err) {
    resultsContainer.innerHTML = `<div class="results-error">${err}</div>`;
  },
  
  createTableView(statuses) {
    if (!statuses.length) {
      search.handleError('No results found');
      return false;
    }
    
    var view = `
      <table class="results-table">
        <thead>
          <tr>
            <th colspan="2">User</th>
            <th>Text</th>
            <th>Created at</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    statuses.map( status => {
      let created_at = new Date(status.created_at);
        view = view + `
          <tr>
            <td><img class="results-userImage" src="${status.user.profile_image_url}" /></td>
            <td>${status.user.screen_name}</td>
            <td>${status.text}</td>
            <td>${created_at.toDateString()}</td>
          </tr>
        `;
    });
    
    view = view + '</tbody></table';
    resultsContainer.innerHTML = view;
  },
  
  doSearch() {
    var searchVal = searchInput.value;
    
    if (!searchVal.length) {
      search.handleError('Please enter a string');
      return false;
    }
    
    if (searchVal.split(' ').length > 10) {
      search.handleError('Please enter less than 10 keywords');
      return false;
    }
    
    request.search(searchVal).then(search.createTableView);
  }
};



searchBtn.addEventListener('click', search.doSearch);
searchInput.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;
    
    if (key === 13) {
      search.doSearch();
    }
});
