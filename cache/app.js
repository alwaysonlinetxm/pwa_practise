if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(function(reg) {
    if(reg.installing) {
      console.log('Service worker installing');
    } else if(reg.waiting) {
      console.log('Service worker installed');
    } else if(reg.active) {
      console.log('Service worker active');
    }

  }).catch(function(error) {
    // registration failed
    console.log('Registration failed with ' + error);
  });
}

document.querySelector('#app').addEventListener('click', function() {
  fetch('//offline-news-api.herokuapp.com/stories').then(function(res) {
    console.log(res);
  });
}, { capture: false });
