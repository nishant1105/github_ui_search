// App.js
const FETCH_RECS_PER_PAGE = 50;
const DISP_RECS_PER_PAGE = 5;

class GitHubSearchApp {
    constructor() {
        this.myForm = document.getElementById("searchForm");
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('previousBtn');
        this.totalCountDiv = document.getElementById('totalCountOfRes');
        this.totalCountSpan = document.getElementById('numResultsFound');
        this.pageNavDiv = document.getElementById("pageNavigation");
        this.summaryContainer = document.getElementById("userSummaryContainer");
        this.resetApp();
        this.addEventListeners();
    }

    // Reset APP: Reset UI state and vars on every new search action
    resetApp() {
        this.initializeVars();
        this.hidePageNavigationBtns();
        this.disablePrevBtn();
        this.disableNextBtn();
        this.hideTotalCount();
    }

    initializeVars() {
        this.isSummaryHidden = true;
        this.searchStr = '';
        this.numRepos = 0;
        this.userData = [];
        this.currStart = 0;
        this.currEnd = DISP_RECS_PER_PAGE;
        this.currPage = 1;
        this.currAPIPage = 1;
        this.lastPage = Number.MAX_SAFE_INTEGER;
    }

    // Event Handlers
    addEventListeners() {
        this.myForm.onsubmit = this.handleOnSubmit.bind(this);
        this.nextBtn.onclick = this.handleNextBtn.bind(this);
        this.prevBtn.onclick = this.handlePrevBtn.bind(this);
    }

    handleOnSubmit(e) {
        e.preventDefault();
        this.resetApp();
        var searchBar = document.getElementById("searchBar");
        this.searchStr = searchBar.value.trim();
        searchBar.value = this.searchStr;
        const PAGE = 1;
        this.fetchDataByPage(this.searchStr, PAGE);
    }

    handleNextBtn(e) {
        e.stopPropagation();
        this.nextPage();
        this.currStart = this.currEnd;
        this.currEnd = this.currPage * DISP_RECS_PER_PAGE;
        if (this.currStart >= this.currAPIPage * FETCH_RECS_PER_PAGE) {
            // Fetch new data only if we need it
            this.currAPIPage++;
            this.fetchDataByPage(this.searchStr, this.currAPIPage);
        } else {
            // Use existing data to display current page
            this.display_data(this.userData, this.currStart, this.currEnd);
        }
    }

    handlePrevBtn(e) {
        e.stopPropagation();
        this.prevPage();
        this.currStart = this.currStart - DISP_RECS_PER_PAGE;
        this.currEnd = this.currPage * DISP_RECS_PER_PAGE;
        this.display_data(this.userData, this.currStart, this.currEnd);
    }

    // UI Style Helpers
    disablePrevBtn() {
        this.prevBtn.classList.add("disabled", "disable-btn");
    }

    enablePrevBtn() {
        this.prevBtn.classList.remove("disabled", "disable-btn");
        this.prevBtn.classList.add("enable-btn");
    }

    disableNextBtn() {
        this.nextBtn.classList.add("disabled", "disable-btn");
    }
    
    enableNextBtn() {
        this.nextBtn.classList.remove("disabled", "disable-btn");
        this.nextBtn.classList.add("enable-btn");
    }
    
    hidePageNavigationBtns() {
        this.pageNavDiv.classList.add("hidden-div");
        this.pageNavDiv.classList.remove("visible-div");
    }
    
    showPageNavigationBtns() {
        this.pageNavDiv.classList.add("visible-div");
        this.pageNavDiv.classList.remove("hidden-div");
    }

    hideTotalCount() {
        this.totalCountDiv.classList.add("hidden-div");
        this.totalCountDiv.classList.remove("visible-div");
    
    }
    showTotalCount(num) {
        this.totalCountSpan.innerHTML = num;
        this.totalCountDiv.classList.remove("hidden-div");
        this.totalCountDiv.classList.add("visible-div");
    }

    // Business Logic
    fetchDataByPage(/*query*/q, /*page*/p) {
        // There is a limit on the Github API calls. To optimize it, fetch 50 records at a time.
        // We will display only 5 records per page, so we fetch 10 pages at a time

        // fetch p-th 50 records for the search string q
        var user_search_url = "https://api.github.com/search/repositories?q=" + q + "&page=" + p +
                              "&per_page=" + FETCH_RECS_PER_PAGE;
        fetch(user_search_url) 
        .then((res) => res.json())
        .then((data) => {
            // Cache the fetched records, so that fetching is not needed when navigating to previous pages
            // We only fetch new data while moving forward to next pages
            this.userData = this.userData.concat(data.items);
            this.lastPage = Math.ceil(data.total_count / DISP_RECS_PER_PAGE);
            if (this.lastPage > 1) {
                this.enableNextBtn();
            }
            this.numRepos = data.total_count;
            this.display_data(this.userData, this.currStart, this.currEnd);
            if (this.isSummaryHidden) {
                this.showTotalCount(this.numRepos);
                this.showPageNavigationBtns();
                this.isSummaryHidden = false;
            }
        })
        .catch(err => {
            // Assume Zero repositories found
            this.showTotalCount(0);
            this.hidePageNavigationBtns();
            console.log(err);
        });
    }

    display_data(data, start, end) {
        // TODO: Optimize dom element deletion and recreation: 
        // Can preallocate doms for 5 records in the HTML and only update the innerHTML for each page
        while(this.summaryContainer.firstChild) {
            this.summaryContainer.removeChild(this.summaryContainer.firstChild);
        }
        // last page can have lesst than 5 records
        if (end > data.length) { end = data.length; }
        for (let id = start; id < end; id++) {
            let currRepo = data[id];

            // Create div container for summary of search results
            var userDiv = document.createElement("div");
            userDiv.classList =["container user-div"];
    
            // Create div for user avatar
            var userAvatar = document.createElement("img");
            userAvatar.src = currRepo.owner.avatar_url;
            userAvatar.classList = ["avatar"];
            userAvatar.addEventListener('click', function(e) {
                e.stopPropagation();
                // Open link in new tab
                window.open(currRepo.html_url, '_blank');
            });
            userDiv.appendChild(userAvatar);
    
            // Create div for text / info
            var userMetadataDiv = document.createElement("div");
            userMetadataDiv.classList =["inline-div"];
    
            // Username div
            var usernameDiv = document.createElement("a");
            usernameDiv.innerHTML = "<b>Owner: " + currRepo.owner.login + "</b>";
            usernameDiv.classList = ["link-primary clickable"];
            usernameDiv.addEventListener('click', function(e) {
                e.stopPropagation();
                // Open link in new tab
                window.open(currRepo.html_url, '_blank');
            });
    
            // Description div
            var repoDesc = currRepo.description;
            if (repoDesc === null) { repoDesc = ""; }
            var descDiv = document.createElement("div");
            descDiv.innerHTML = "Description: " + repoDesc;
    
            // Stargazer div
            var stargazerDiv = document.createElement("a");
            stargazerDiv.innerHTML = "Stargazers: " + currRepo.stargazers_count;
            stargazerDiv.classList = ["link-primary clickable"];
            var stargazersUrl = currRepo.svn_url + "/stargazers";
            stargazerDiv.addEventListener('click', function (e) {
                e.stopPropagation();
                window.open(stargazersUrl, '_blank');
            });
            
            // Arrange User metadata dom
            userMetadataDiv.appendChild(usernameDiv);
            userMetadataDiv.appendChild(descDiv);
            userMetadataDiv.appendChild(stargazerDiv);
            
            // Arrange user info dom
            userDiv.appendChild(userAvatar);
            userDiv.appendChild(userMetadataDiv);
    
            // Append new user dom
            this.summaryContainer.appendChild(userDiv);
        }
    }

    nextPage() {
        this.currPage++;
        if (this.currPage > 1) {
            this.enablePrevBtn();
        }
        if (this.currPage >= this.lastPage) {
            this.disableNextBtn();
        }
    }

    prevPage() {
        this.currPage--;
        if (this.currPage === 1) {
            this.disablePrevBtn();
        }
        if (this.currPage < this.lastPage) {
            this.enableNextBtn();
        }
    }
}

// Start App
console.log('Window is Up!');
var myApp = new GitHubSearchApp();
