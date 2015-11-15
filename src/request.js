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
    //TODO: this should be a promise
    var promise = new Promise((resolve, reject) => {
      const encodedConsumerKey = encodeURIComponent(this.consumerKey);
      const encodedConsumerSecret = encodeURIComponent(this.consumerSecret);
      const encodedKeys = btoa(`${encodedConsumerKey}:${encodedConsumerSecret}`);
      
      let xhttp = new XMLHttpRequest();
      
      xhttp.open('POST', 'https://api.twitter.com/oauth2/token');
      xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      xhttp.setRequestHeader('Authorization', `Basic ${encodedKeys}`);
      xhttp.send('grant_type=client_credentials');
      
      xhttp.onload = () => {
        if (xhttp.status === 200) {
          resolve(xhttp.response.access_token);
        } else {
          reject('Error >> ', xhttp.statusText);
        }
      };
        
      xhttp.onerror = function () {
        reject('Error >> ', xhttp.statusText);
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
  
  search(str) {
    var promise = new Promise((resolve, reject) => {
      this.getToken().then( token => {
        let xhttp = new XMLHttpRequest();
        
        xhttp.open('POST', 'https://api.twitter.com/oauth2/token');
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        xhttp.setRequestHeader('Authorization', `Bearer ${token}`);
        xhttp.send('grant_type=client_credentials');
        
        xhttp.onload = () => {
          if (xhttp.status === 200) {
            resolve(xhttp.response.access_token);
          } else {
            reject('Error >> ', xhttp.statusText);
          }
        };
          
        xhttp.onerror = function () {
          reject('Error >> ', xhttp.statusText);
        };
      });
      
      
    });
    
    return promise;
  }
}

export default Request;
