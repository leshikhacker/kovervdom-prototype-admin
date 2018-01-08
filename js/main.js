$(document).ready(function() {
  $('.js-choose-row').on('click', function(){
    $(this).closest('tr').toggleClass('selected');
  });

  $('.js-fields-group-rollup').on('click', function() {
    var self = $(this);
    var parent_block = self.closest('.js-fields-group');
    parent_block.find('.js-fields-group-title').toggleClass('hidden');
    parent_block.toggleClass('hidden');
  });
  $('.js-input-file').on('change', function() {
    var self = $(this);
    var parent = self.closest('.js-input-file-wrap');

    parent.find('.js-input-file-label').text(self.val()).addClass('active');
  });
});
