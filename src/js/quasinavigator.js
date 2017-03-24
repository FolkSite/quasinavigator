/**
 * @author https://quasi-art.ru
 * @date 15.03.2017
 * @license GPLv2
 */

$.fn.navigator = function(options) {
	// Настройки
	$.fn.navigator.options = $.extend({
		debug: false,
		uri: '',
		callbackOnFail: null,
		callbackOnSuccess: null,
	}, options);

	$.fn.navigator.state = {
		page: 1, // current page [1:inf]
		pp: 10, // per page
	};

	var wrapper = $(this);
	var errors = wrapper.find('[data-navigator="errors"]');
	var loader = wrapper.find('[data-navigator="loader"]');
	var messages = wrapper.find('[data-navigator="messages"]');

	this.bindEventsPagination = function bindEventsPagination() {
		var instance = this;
		$(wrapper).find('[data-navigator="pagination"] a').on('click', function(e) {
			e.preventDefault();
			$.fn.navigator.state.page = parseInt($(this).attr('data-ci-pagination-page'));
			instance.load();
		});
	};

	this.bindEventsList = function bindEventsList() {
		console.log('List!');
	};

	this.init = function init() {
		this.load();
	};

	this.load = function load() {
		$(loader).show();
		var instance = this;
		var postData = {
			mode: 'manager',
			page: $.fn.navigator.state.page,
		};
		
		$.ajax({
			//contentType: true,
			processData: true,
			data: postData,
			dataType: 'json',
			type: 'POST',
			url: $.fn.navigator.options.uri + '/' + $.fn.navigator.state.page,
			complete: function() {
				$(loader).hide();
			},
			error: function(xhr, ajaxOptions, thrownError) {
				if (xhr.status == 404) {
					console.log('Ресурс ' + formAction + ' не найден');
				} else if (xhr.status == 500) {
					console.log('Ошибка 500');
				} else if (xhr.status == 200) {
					console.log('Статус 200');
					console.log('Невалидный JSON');
				} else {
					console.log('Ошибка ' + xhr.status);
				}
			},
			success: function(data, textStatus) {
				if (typeof data == 'object' && data !== null) {
					$(errors).hide();
					$(messages).hide();
					
					if ('html' in data) {
						$(wrapper).find('[data-navigator="output"]').html(data.html);
						instance.bindEventsList();
					}
					if ('pagination' in data) {
						$(wrapper).find('[data-navigator="pagination"]').html(data.pagination);
						instance.bindEventsPagination();
					}
					
					if ('errors' in data && $.isArray(data.errors)) {
						if (data.errors.length > 0) {
							var errorsList = '';
							for (i = 0; i < data.errors.length; i++) {
								if (data.errors[i].length > 0) {
									errorsList += $.fn.navigator.options.errorOpenTag + data.errors[i] + $.fn.navigator.options.errorCloseTag;
								}
							}
							errorsList = $.fn.navigator.options.errorsOpenTag + errorsList + $.fn.navigator.options.errorsCloseTag;
							$(errors).html(errorsList).show();
						}
					}
					// Вывод информационных сообщений
					if ('messages' in data && $.isArray(data.messages)) {
						if (data.messages.length > 0) {
							var messagesList = '';
							for (i = 0; i < data.messages.length; i++) {
								if (data.messages[i].length > 0) {
									messagesList += $.fn.navigator.options.messageOpenTag + data.messages[i] + $.fn.navigator.options.messageCloseTag;
								}
							}
							messagesList = $.fn.navigator.options.messagesOpenTag + messagesList + $.fn.navigator.options.messagesCloseTag;
							$(messages).html(messagesList).show();
						}
					}
	                if ('success' in data) {
	                    if (data.success) {
	                        // Функция, которую нужно исполнить после успеха
	                        if ('callbackOnSuccess' in options && typeof options.callbackOnSuccess == 'function') {
	                            options.callbackOnSuccess(wrapper);
	                        }
	                    } else {
	                        // Функция, которую нужно исполнить после неуспешного запроса
	                        if ('callbackOnFail' in options && typeof options.callbackOnFail == 'function') {
	                            options.callbackOnFail(wrapper);
	                        }
	                    }
	                } else {
	                    if (options.debug) {
	                         console.log('Ответ сервера не содержит поле success');
	                    }
	                }
				} else {
	                if (options.debug) {
	                     console.log('Ответ сервера имеет неверный формат');
	                }
				}
			}
		});
	};

	return this;
};
