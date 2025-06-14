// Keep only one fetch call and remove variable assignments
fetch('navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar').innerHTML = data;

    // Add active link class after navbar is loaded
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
        link.closest('.nav-item').classList.add('active');
      }
    });
  });

fetch('footer.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('footer').innerHTML = data;
  });



  
  





