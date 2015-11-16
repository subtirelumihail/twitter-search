class Request {
  constructor(key, secret) {
    this.consumerKey = key;
    this.consumerSecret = secret;
  }

  checkTokenInStorage() {
    return localStorage.getItem('token');
  }
  
  saveTokenInStorage(token) {
    return localStorage.setItem('token', token);
  }
  
  requestToken() {
    var promise = new Promise((resolve, reject) => {
      const encodedConsumerKey = encodeURIComponent(this.consumerKey);
      const encodedConsumerSecret = encodeURIComponent(this.consumerSecret);
      const encodedKeys = btoa(`${encodedConsumerKey}:${encodedConsumerSecret}`);

      let xhttp = new XMLHttpRequest();
      
      xhttp.open('POST', 'https://api.twitter.com/oauth2/token', true);
      xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      xhttp.setRequestHeader('Authorization', `Basic ${encodedKeys}`);
      xhttp.withCredentials = true;
      xhttp.send('grant_type=client_credentials');
      
      xhttp.onload = () => {
        if (xhttp.status === 200) {
          let res = JSON.parse(xhttp.response);
          this.saveTokenInStorage(res.access_token);
          resolve(res.access_token);
        } else {
          reject('Error >> ', xhttp);
        }
      };
        
      xhttp.onerror = function () {
        reject('Error >> ', xhttp);
      };
    });
    
    return promise;
  }

  getToken() {
    var promise = new Promise((resolve, reject) => {
      let token = this.checkTokenInStorage();
      
      if (token) {
        resolve(token);
      } else {
        this.requestToken().then(resolve).catch(reject);
      }
    });
    
    return promise;
  }
  
  loadMore() {
    
  }
  
  search(str) {
    var promise = new Promise((resolve, reject) => {
      this.getToken().then( token => {
        let xhttp = new XMLHttpRequest();
        
        xhttp.open('GET', `https://api.twitter.com/1.1/search/tweets.json?q=${encodeURIComponent(str)}`, true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhttp.setRequestHeader('Authorization', `Bearer ${token}`);
        xhttp.send('grant_type=client_credentials');
        xhttp.onload = () => {
          if (xhttp.status === 200) {
            let res = JSON.parse(xhttp.response);
            resolve(res.statuses);
          } else {
            reject('Error >> ', xhttp);
          }
        };
          
        xhttp.onerror = function () {
          reject('Error >> ', xhttp);
        };
      });
      
      
    });
    
    return promise;
  }
}

export default Request;
