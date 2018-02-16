var FormPropertiesController = function() {
  this.$parentWrapper = $('.js-properties-selected');

  this.handleElements = function(elements, type) {
    var values = [];
    elements.each(function() {
      var is_checkbox = (type == 'checkbox');
      var is_select = (type == 'SELECT');
      var _self = $(this);
      if(is_checkbox) {
        if(_self.is(":checked")) {
          var _id = _self.attr('id');
          var label = $('[for="' + _id + '"]');
          var text = label.data('label');
          text = text ? text : label.text();
        }
      }
      else if(is_select) {
        if(_self.val()) {
          var _id = _self.attr('id');
          var option = _self.find('option:selected');
          var text = option.text();
        }
      }

      if(_id && text) {
        values.push({
          id: _id,
          text: text.toLowerCase()
        })
      }

    });
    return values;
  };

  this.buildSwitcher = function(control_name, data) {
    var container = $('body').find('[id="for_' + control_name + '"]');
    var container_buttons = container.find('.js-properties-selected-reset-button');

    // вспомогательные переменные для цикла
    var existing_item;
    var button_template;

    container_buttons.hide();
    if(data.length > 0) {
      container.removeClass('hidden');
    }
    else {
      container.addClass('hidden');
    }

    for(var i in data) {
      existing_item = container.find('[data-id="' + data[i]['id'] + '"]');
      if(existing_item.length) {
        existing_item.text(data[i]['text']).show();
      }
      else {
        button_template = this.getOffButtonTemplate(data[i]['id'], data[i]['text']);
        container.append(button_template);
      }
    }

    if(container.find('.js-properties-selected-reset-button').is(':visible')) {
      container.show();
    }
  };

  this.getOffButtonTemplate = function(id, name) {
    return '<button type="button" data-id="' + id + '" class="properties-selected-button js-properties-selected-reset-button">' + name + '</button>';
  };
};
var formPropertiesController = new FormPropertiesController();

function makeElementFixed(container, offset, affected_element, need_recalculate_width) {
  if(container.length > 0) {
    var block_offset = container.offset().top;
    var fixed_class_name = affected_element.data('fixed-class');

    if(block_offset <= offset) {
      affected_element.addClass(fixed_class_name);
      if(need_recalculate_width) recalculateTableRowsWidth(container, affected_element);
    }
    else {
      affected_element.removeClass(fixed_class_name);
    }
  }
}

var show_table;
function recalculateTableRowsWidth(table, table_header) {
  var table_row = $(table.find('.js-row').eq(0));

  table_header.children('th').each(function(i) {
    var _column = $(this);
    var col_width = $($(table_row).children('td').eq(i)).css('width');
    _column.css('width', col_width)
  });
}

$(document).ready(function() {
  // один из чекбоксов активности всегда выбран
  $('.js-active-checkbox').on('click', function(e) {
    var self = $(this);

    var restore_check = true;
    $('.js-active-checkbox').each(function() {
      if($(this).is(':checked')) {
        restore_check = false;
      }
    });

    if(restore_check) {
      e.preventDefault();
      return false;
    }
  });

  // выделение целого столбца по клику на его название
  $('.js-choose-column').on('click', function() {
    var self = $(this);
    var table = self.closest('table');
    var rows = table.find('.js-row');

    if(rows.hasClass('selected')) {
      var column_class = table.find('.' + self.data('column-class'));

      table.find(column_class).toggleClass('selected');
      self.toggleClass('selected');

      if(
        ($('body .js-row.selected').length > 0 && $('.js-choose-column.selected').length > 0)
        ||
        ($('.js-choose-column-properties.selected').length > 0)
      ) {
        $('.js-show-table-edit').show();
      }
      else {
        $('.js-show-table-edit').hide();
      }
    }
  });

  // выделение группы свойств - показ списка свойств
  $('.js-choose-column-properties').on('click', function(e) {
    var self = $(this);
    var table = self.closest('table');
    var rows = table.find('.js-row');

    if(rows.hasClass('selected')) {
      if($(e.target).hasClass('js-choose-column-properties')) {
        $('.js-choose-properties-list').toggleClass('active');
      }
    }
  });

  // выделение группы свойств - собственно, выделение
  $('.js-choose-column-properties').on('click', 'li', function() {
    var self = $(this),
        table = self.closest('table'),
        th = self.closest('th');
        column_class = th.data('column-class');

    self.toggleClass('selected');

    if($('.js-choose-column-properties').find('li.selected').length > 0) {
      table.find('.' + column_class).addClass('selected');
      th.addClass('selected');
    }
    else {
      table.find('.' + column_class).removeClass('selected');
      th.removeClass('selected');
    }

    if(
      ($('body .js-row.selected').length > 0 && $('.js-choose-column.selected').length > 0)
      ||
      ($('.js-choose-column-properties.selected').length > 0)
    ) {
      $('.js-show-table-edit').show();
    }
    else {
      $('.js-show-table-edit').hide();
    }
  });

  // выделение строки по клику на первый столбец
  $('body').on('click', '.js-choose-row', function(){
    var self = $(this),
        tr = self.closest('tr');

    tr.toggleClass('selected');


    // логика-логика
    var at_least_one_row_selected = ($('body .js-row.selected').length > 0),
        at_least_one_column_selected = ($('.js-choose-column.selected').length > 0),
        prop_column_selected = $('.js-choose-column-properties.selected').length > 0;

    if(at_least_one_row_selected) {
      if(at_least_one_column_selected || prop_column_selected) {
          $('.js-show-table-edit').show();
      }

      // список айдищников свойств при сохранении с помощью шаблонов значений
      var selected_items = [];
      $('body .js-row.selected').each(function() {
          selected_items.push($(this).data('item-id'));
      });
      $('.js-template-buttons').data('item-ids', selected_items.join(','));
      $('.js-template-button-apply').removeClass('disabled');
    }
    else {
      $('.js-show-table-edit').hide();
      $('body').find('.js-column').removeClass('selected');
      $('.js-choose-properties-list').removeClass('active');
      $('.js-template-button-apply').addClass('disabled');
    }
  });

  // выделение строки по клику на колонку ID
  $('.js-choose-all-rows').on('click', function() {
    var $row = $('.js-row');
    var $row_selected = $('.js-row.selected');
    if($row.length == $row_selected.length) {
      $row.removeClass('selected');
      $('.js-show-table-edit').hide();
    }
    else {
      $row.addClass('selected');
      if($('body .js-row.selected').length > 0 && $('.js-choose-column.selected').length > 0) {
        $('.js-show-table-edit').show();
      }
      else {
        $('.js-show-table-edit').hide();
      }
    }
  });

  // попап множественного редактирования свойств
  $('.js-show-table-edit').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    // собиарем данные, которые будут отвечать за генерацию формы добавления
    var data = {
      props: [],
      items: []
    };
    $('body .js-row.selected').each(function() {
      data.items.push($(this).data('item-id'));
    });

    if(data.items.length > 0) {
      $('.js-choose-column.selected').each(function() {
        data.props.push($(this).data('prop-name'));
      });

      $('.js-choose-properties-list').find('li.selected').each(function() {
        data.props.push($(this).data('prop-name'));
      });

      data = $.param(data);

      // на беке: $.post на php-файл
      $.get('ajax-add-table.html', data, function(res) {
        var html = res;
        $.fancybox.open(html);
      });
    }


  });

  // аякс-пагинация
  $('.js-show-all').on('click', function() {
    var self = $(this);
    fetch('ajax-table-rows.html').then(function(response) {
      return response.text();
     })
    .then(function(html) {
      $('.js-show-table').append(html);
      self.hide();
      $('.js-pagination').hide();
    })
    .catch();
  });

  // свертывание-развертывание групп свойств
  $('body').on('click', '.js-fields-group-rollup', function() {
    var self = $(this);
    var parent_block = self.closest('.js-fields-group');
    parent_block.find('.js-fields-group-title').toggleClass('hidden');
    parent_block.toggleClass('hidden');
  });

  // немного js для кастомного инпут-файла
  $('.js-input-file').on('change', function() {
    var self = $(this);
    var parent = self.closest('.js-input-file-wrap');

    parent.find('.js-input-file-label').text(self.val()).addClass('active');
  });

  // связывание контролов формы - с контролами сброса значений свойств
  // актуально для всяких селектов и чекбоксов
  $(".js-input-binded").on('change', function() {
    var self = $(this);
    var attr_name = self.attr('name');
    var attr_type = self.attr('type');
    attr_type = attr_type ? attr_type : self.prop("tagName");

    // для группы чекбоксов, к примеру
    var relative_elements = $('[name="' + attr_name + '"]');

    // структура, куда складываем значения контролов формы
    self_values = formPropertiesController.handleElements(relative_elements, attr_type);
    formPropertiesController.buildSwitcher(attr_name, self_values);
  });

  // сброс значений свойств на странице добавления
  $('body').on('click', '.js-properties-selected-reset-button', function() {
    var self = $(this);
    var form_control_id = self.data('id');

    var el = $('body').find('[id="' + form_control_id + '"]');

    var el_type = el.attr('type');
    el_type = el_type ? el_type : el.prop("tagName");

    if(el_type == 'checkbox') {
      el.prop('checked', false).change();
    }
    else if(el_type == 'SELECT') {
      el.val('').change();
    }
  });

  // для демо, нужен для бека свой обработчик
  $('body').on('click', '.js-popup-save', function(e) {
    e.preventDefault();
    e.stopPropagation();

    $.fancybox.close();
  });

  $('body').on('click', '.js-show-more-properties', function(e) {
    e.preventDefault();
    var self = $(this);
    var table = self.closest('.js-show-table');
    var row_index = self.data('row-id');
    var row = table.find('.js-properties-row-' + row_index);


    row.slideToggle();
  });

  // сохранение шаблонов значений свойств
  $('body').on('click', '.js-template-button-save', function() {
    var self = $(this);
    var form = self.closest('.js-add-form');
    var form_data = form.serialize();

    var template_name = self.closest('.js-template-buttons-save').find('[name=input_template_name]').val();

    if(template_name) {
      // примерно так будут отправляться данные
      // $.post('save-data-template.php', form_data, function(res) {
      //
      // });


      $('.js-template-buttons').append(
        ' <button type="button" class="button template-button js-template-button">' + template_name + '</button> '
      );
    }
  });

  // применение сохоаненных шаблонов значений свойств
  $('body').on('click', 'js-template-button-apply', function() {

  });

  // применение существующего шаблона значений для формы
  $('body').on('click', '.js-template-button', function() {
    var form = $(this).closest('.js-add-form');
    // предварительно все чистим
    form.find('[type=text], textarea').val('');
    form.find('[type=checkbox]').prop('checked', false);
    form.find('select').prop('selectedIndex', 0);

    $.get('template-data.json', function(res) {
      for(var i in res) {
        if(res[i].type == "text") {
          form.find("[name='"+ res[i].name  +"']").val(res[i].value);
        }
        else if(res[i].type == "checkbox") {
          form.find("[name='"+ res[i].name  +"']").prop('checked', true);
        }
        else if(res[i].type == "select") {
          form.find("[name='"+ res[i].name  +"']").find("option[value='"+ res[i].value +"']").prop('selected', true);
        }

      }

    });
  });

  // выбор сразу всех чекбоксов в столбце
  $('.js-choose-checkbox-column').on('click', function() {
    var self = $(this),
        table = self.closest('table'),
        rows = table.find('.js-row'),
        column_class = table.find('.selected .' + self.data('column-class')),
        checkboxes = column_class.find('.input-checkbox');

    if(rows.hasClass('selected')) {
      if(checkboxes.prop('checked')) {
        checkboxes.prop('checked', false);
      }
      else {
        checkboxes.prop('checked', true);
      }

      $('.js-show-table-save').show();
    }
  });

  // показ кнопки сохранить по изменению значений селектов
  $('body').on('change', '.js-select-changed', function() {
    $('.js-show-table-save').show();
  });



  // плавающие:
  // - кнопка фильтрации
  // - хедер таблица
  // - кнопка "Сохранить"
  $(window).on('scroll', function(e) {
    var window_offset = $(this).scrollTop();

    var $filter_button_block = $('.js-filter-button-block');
    // var $show_table_row = $('body').find('.js-show-table-row');
    var $show_table_row = $('.js-show-table-row');


    makeElementFixed($filter_button_block, window_offset, $('.js-filter-button'));
    makeElementFixed($('.js-show-table'), window_offset, $('.js-show-table-row'), true);
    makeElementFixed($('.js-button-fixed-container'), window_offset, $('.js-button-fixed'));

  });
});
