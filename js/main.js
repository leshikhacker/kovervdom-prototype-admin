$(document).ready(function() {
  $('.js-choose-row').on('click', function(){
    $(this).closest('tr').toggleClass('selected');
  });
});
