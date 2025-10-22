
$(function()
{
  
	if (window.location.protocol == 'http:')
	{
		window.location.href = window.location.href.replace('http', 'https')
	}
	else
	{	
        $('.smoothscroll').on('click', function (e) {
            var target = this.hash,
            $target    = $(target);
            
                e.preventDefault();
                e.stopPropagation();

            $('html, body').stop().animate({
                'scrollTop': $target.offset().top
            }, 800, 'swing').promise().done(function () {

                window.location.hash = target;
            });
        });

        window.app =
        {
            controller: entityos._util.controller.code,
            vq: entityos._util.view.queue,
            get: entityos._util.data.get,
            set: entityos._util.data.set,
            invoke: entityos._util.controller.invoke,
            add: entityos._util.controller.add,
            show: entityos._util.view.queue.show
        };

        entityos._util.controller.invoke('cardano-wallets-init');
        entityos._util.controller.invoke('cardano-wallets-news');
    }
});

entityos._util.controller.add(
{
    name: 'cardano-wallets-init',
    code: function ()
    {
		let urlData = 'https://raw.githubusercontent.com/selfdriven-octo/cardano-wallets/main/data/cardano-wallets.json'
		
		if (window.location.pathname == '/next')
		{
			urlData = 'https://raw.githubusercontent.com/selfdriven-octo/about/main/community-projects-we-support/cardano-wallets/data/cardano-wallets-next.json'
		}

        $.ajax(
        {
            type: 'GET',
            url: urlData,
            cors: false,
            cache: false,
            dataType: 'json',
            success: function(data)
            {
				app.set(
				{
					scope: 'cardano-wallets',
					context: 'all',
					value: data.cardano.wallets.data
				});

				const uriHash = window.location.hash

				if (uriHash != '')
				{
					const uriContextData = _.replace(uriHash, '#', '');

					if (uriContextData != '')
					{
						if (_.includes(uriContextData, 'experience:'))
						{
							let searchExperience = _.replace(uriContextData, 'experience:', '');
							searchExperience = _.replace(searchExperience, '-', ' ');
							app.set({scope: 'cardano-wallets', context: 'experience', value: searchExperience});
						}
						
						if (_.includes(uriContextData, 'search-text:'))
						{
							let searchText = _.replace(uriContextData, 'search-text:', '');
							$('#cardano-wallets-search-text').val(searchText);
							app.set({scope: 'cardano-wallets', context: 'search-text', value: searchText});
						}
					}
				}
				
				app.invoke('cardano-wallets-search');
			},
            error: function (data) {}
		});
	}
});

entityos._util.controller.add(
{
    name: 'cardano-wallets-search',
    code: function ()
    {
		const wallets = app.get(
		{
			scope: 'cardano-wallets',
			valueDefault: {}
		});

		if (wallets.all != undefined)
		{
			let walletsSearched = wallets.all;

			if (wallets['search-text'] != '' && wallets['search-text'] != undefined)
			{
				var searchText = wallets['search-text'].toLowerCase();

				_.each(walletsSearched, function (wallet)
				{
					wallet._descriptionSearch = _.join(_.map(wallet.description, function (description) {return description}), '');
				});

				walletsSearched = _.filter(walletsSearched, function (wallet)
				{
					return  (_.includes(wallet.name.toLowerCase(), searchText)
								|| _.includes(wallet._descriptionSearch.toLowerCase(), searchText)
							)
				});
			}

			if (wallets['search-testing'] != '1')
			{
				walletsSearched = _.filter(walletsSearched, function (wallet)
				{
					wallet._testing = _.includes(wallet.statuses, 'testing');
					return !wallet._testing
				});
			}


			if (wallets['search-experience-keep-it-simple'] == '1')
			{
				walletsSearched = _.filter(walletsSearched, function (wallet)
				{
					wallet._experience = _.includes(wallet['user-experiences'], 'keep-it-simple');
					return wallet._experience
				});
			}

			if (wallets['search-experience-dgov'] == '1')
			{
				walletsSearched = _.filter(walletsSearched, function (wallet)
				{
					wallet._experience = _.includes(wallet['user-experiences'], 'dgov');
					return wallet._experience
				});
			}

			let walletsView = app.vq.init({queue: 'wallets-view'});

			walletsView.add('<div class="row">');

			const walletsInstalled = _.get(window, 'cardano', {});
			
			_.each(walletsSearched, function (wallet)
			{
				wallet._available = (walletsInstalled[wallet.name] != undefined);
				wallet._availableStyle = (wallet._available?' border-left-width: 8px !important;':'');
				wallet._availableClass = (wallet._available?' border-left border-success':'');

				wallet._description = _.join(_.map(wallet.description, function (description)
				{
					return '<div class="mt-1 text-secondary">' + description + '</div>'
				}), '');

				wallet._imageHTML = _.join(
					[
						'<div class="col-auto" style="text-align:right; text-align:right; padding-top:2px; padding-right: 0px;padding-left: 28px;">',
							'<a class="" href="', wallet.url, '" target="_blank">',
								'<img src="/images/blank.icon.svg" class="img-fluid rounded" style="width:40px;">',
							'</a>',
						'</div>'
					],'');

				if (_.has(wallet, 'images.icon'))
				{
					if (_.includes(wallet.images.icon, '.svg'))
					{
						wallet._imageHTML = _.join(
						[
							'<div class="col-auto" style="text-align:right; text-align:right;padding-right: 0px; padding-top:2px; padding-left: 28px;">',
								'<a class="" href="', wallet.url, '" target="_blank">',
									'<img src="/images/', wallet.images.icon, '" class="img-fluid rounded" style="width:40px;">',
								'</a>',
							'</div>'
						],'');
					}
				}

				walletsView.add(
				[
					'<div class="col-12 col-md-6 col-xl-4 py-4">',
						'<div class="card shadow-lg', wallet._availableClass, '" style="height:100%;', wallet._availableStyle, '">',
							'<div class="card-body p-4 h-100 text-left">',
								'<div class="row">',
									wallet._imageHTML,
									'<div class="col">',
										'<h2 class="fw-bold mb-2" style="color: #e8d5cf;">',
											'<a class="" href="', wallet.url, '" target="_blank">', wallet.caption, '</a>',
										'</h2>',
										'<div id="cardano-wallet-', wallet.name, '">',
											wallet._description,
										'</div>',
									'</div>',
								'</div>',
							'</div>',
						'</div>',
					'</div>'
				]);
			});

			walletsView.add('</div>');

			walletsView.render('#wallets-view');
		}
       
    }
});

entityos._util.controller.add(
{
    name: 'cardano-wallets-news',
    code: function ()
    {
        $.ajax(
        {
            type: 'GET',
            url: 'https://raw.githubusercontent.com/selfdriven-octo/cardano-wallets/main/data/cardano-wallets-news.json',
            cors: false,
            cache: false,
            dataType: 'json',
            success: function(data)
            {
                var walletsNewsView = app.vq.init({queue: 'wallets-news-view'});
                var walletNews = data.cardano.wallets.news.data;

                if (walletNews != undefined)
                {
                    walletsNewsView.add('<ul>');

                    _.each(walletNews, function (_walletNews)
                    {
                        walletsNewsView.add(
                        [
                           '<li class="mt-2">',
                                '<div ><a class="fw-bold"target="_blank" href="',  _walletNews.url, '">', _walletNews.description, ' <i class="fe fe-external-link"></i></a></div>',
                                '<div class="small text-secondary">', _walletNews.date, ' | ', _walletNews.by,'</div>',
                            '</li>'
                        ]);
                    });

                    walletsNewsView.add('</ul>');

                    walletsNewsView.render('#wallet-news-view');
                }
            },
            error: function (data) {}			
        });
    }
});