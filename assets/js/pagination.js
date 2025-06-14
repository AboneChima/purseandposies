function showPage(pageNumber) {
    // Hide all pages
    var pages = document.querySelectorAll('.page');
    pages.forEach(function(page) {
        page.style.display = 'none';
    });

    // Show the selected page
    document.getElementById('page' + pageNumber).style.display = 'block';
}

// By default, show the first page
showPage(1);
