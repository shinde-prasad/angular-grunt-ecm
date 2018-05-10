$(function () {
  //Quick links toggle function
  $('.quickLinksList > li a').click(function() {
    $(this).parent().find('ul').toggle();
  });
});