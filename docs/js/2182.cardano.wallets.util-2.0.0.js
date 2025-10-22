import { EntityOS } from '/site/2152/entityos.module.class-1.0.0.js';
const eos = new EntityOS();

// BASED ON DSOCIETY | WALLET-BY-EXAMPLE

// Getting a "foot-hold" on the Cardano tech by connecting to a wallet and querying on-chain data.

// Code is free to use.
// It is only provided as to aid learning about connecting to the Cardano blockchain/wallet.
// To that purpose it uses Javascript in its simplest form, so as to keep focus on the blockchain/wallet conceptual learning.
// Recommend using resources @ https://buildingoncardano.dev if plan to build a production-grade app.

// Each of the wallets have their own code files loaded into the browser
// They all expose the same functions (methods) based on the CIP-30 standard.
// In the example if you look at the wallet variable in the browser console you will see the methods. i.e. console.log(wallet)
// e.g. wallet.getBalance().then(function (walletData) {}) - walletData being the data returned by the wallet.

// The data is stored in the CBOR format - which is used to store data on Cardano and transfer it over http(s).
// This example code uses the entityOS import for some basic help functions to conver the data, so it can be used by the Javascript code.

// https://github.com/cardano-foundation/cardano-connect-with-wallet/blob/main/core/utils/wallet.ts
// https://www.npmjs.com/package/@stricahq/typhonjs
// https://cdn.jsdelivr.net/npm/@stricahq/typhonjs@1.2.8/dist/index.min.js
// https://www.jsdelivr.com/package/npm/@stricahq/typhonjs

eos.add(
[
	{
		name: 'wallet-init',
		code: function ()
		{
			console.log('Supported by selfdrivenOcto "Be Curious, Be Caring".');
			console.log('https://selfdriven.foundation/about/octo\n\n');
			console.log('& Turlia "We have an opportunity to descentralise & rehumanise our society".');
			console.log('https://dsociety.io\n\n');

			eos.invoke('wallet-init-cardano');
		}
	},
	{
		name: 'wallet-init-cardano',
		code: function ()
		{
            // [1] Set up a standard set of wallets that work in the browser
			// https://www.cardanocube.io/collections/wallets for full list.
           
			console.log('## Browser wallets:')

            var cardanoData = window.cardano;
            if (cardanoData == undefined) {cardanoData = {}}

			var _cardano =
			{
				data: cardanoData,
				wallets:
				[
					{
						name: 'eternl',
						names: ['eternl', 'ccvault'],
						caption: 'Eternl'
					},
					{
						name: 'flint',
						caption: 'Flint'
					},
					{
						name: 'gerowallet',
						caption: 'Gero Wallet'
					},
					{
						name: 'nami',
						caption: 'Nami'
					},
					{
						name: 'nufi',
						caption: 'NuFi'
					},
					{
						name: 'typhoncip30',
						names: ['typhoncip30', 'typhon'],
						caption: 'Typhon'
					},
					{
						name: 'yoroi',
						caption: 'Yoroi'
					},
					{
						name: 'lace',
						caption: 'Lace'
					}	
				]
			};

			// [2] Check for installed wallets by querying: window.cardano

			_.each(_cardano.wallets, function (_wallet)
			{
				_wallet.enabled = (_cardano.data[_wallet.name] != undefined)
			});

			// [3] Put in browser data for using later as required.

			eos.set(
			{
				scope: 'wallet',
				context: 'cardano',
				value: _cardano
			});

			// [4] Reduce to set of wallets available in the this browser.

			var wallets = eos.set(
			{
				scope: 'wallet',
				context: 'wallets',
				value: _.filter(_cardano.wallets, function (_wallet) {return _wallet.enabled})
			});

			console.log(_cardano);
			console.table(wallets);
			console.log('\n');

			// [5] Show wallets to user or not to install

            if (wallets.length == 0)
            {
				$('#wallet-view').html(
                    '<div class="mt-4 mb-2">' +
                        '<div class="fw-bold text-secondary">There are no wallets installed.</div>' +
                     '</div>');
			}
            else
            {
               var learnConnectWalletsView = eos.view()

                _.each(wallets, function (wallet)
                {
                    learnConnectWalletsView.add(
                    [
                        '<div class="text-center">',
                            '<a class="entityos-click" style="color:#fff !important;"',
                                ' data-name="', wallet.name, '"',
                                ' data-controller="wallet-connect" data-context="wallet" data-scope="wallet-connect">',
                                wallet.caption,
                            '</a>',
                        '</div>'
                    ]);
                });

                $('#wallet-connect').removeClass('disabled').popover(
                {
                    content: learnConnectWalletsView.get(),
                    html: true,
                    placement: 'bottom',
                    template: '<div class="popover" role="tooltip"><div class="popover-arrow"></div><div class="popover-body"></div></div>',
                    offset: [0,10],
					sanitize: false
                }).on('show.bs.popover', function ()
				{
					$('#wallet-view').html('');
				});

                $('#wallet-view').html('<div class="mt-6" style="font-size: 1.2rem;"><div class="fw-bold text-secondary">Connect to a wallet to see tokens/assets.</div></a>');
            }
		}
	},
    {
		name: 'wallet-connect',
		code: function (param)
		{
			eos.invoke('util-view-popover-hide');

			console.log('## Store Wallet Name:')

			// [6] Get wallet name based on user selection.

			var walletName = entityos._util.param.get(param.dataContext, 'name').value;

			// [7] Set the wallet name in the local browser data, so can be used later.

            eos.set({scope: 'wallet', context: 'wallet-name', value: walletName});

			console.log(walletName);
			console.log('\n');

			var wallets = eos.get({scope: 'wallet', context: 'wallets'});
			var _wallet = _.find(wallets, function (wallet) {return wallet.name == walletName})
			eos.set({scope: 'wallet', context: '_wallet', value: _wallet});

			// [8] Get the wallet assets.

            eos.invoke('wallet-assets', param)
		}
	},
    {
		name: 'wallet-assets',
		code: function (param)
		{
			console.log('## Get & Show Wallet Assets:');

			var showAll = entityos._util.param.get(param.dataContext, 'showAll', {default: true}).value;
			var walletName = eos.get({scope: 'wallet', context: 'wallet-name'});

			// [9] Get the stored wallet & set the button name

			var _wallet = eos.get({scope: 'wallet', context: '_wallet'});

			if (_wallet == undefined)
			{
				var wallets = eos.get({scope: 'wallet', context: 'wallets'});
				_wallet = _.find(wallets, function (wallet) {return wallet.name == walletName});
				eos.set({scope: 'wallet', context: '_wallet', value: _wallet});
			}
			
			if (_wallet != undefined)
			{
				$('#wallet-connect').html(_wallet.caption)
			
				// [10] Get a wallet object i.e. with the functions that can use to interact with the wallet (see Dev Tools > Console)

				window.cardano[walletName].enable().then(function (wallet)
				{
					console.log(wallet);

					// [11] Run the getBalance function
					// It returns data in the Concise Binary Object Representation "CBOR" Hex format.
					// So if you look at it, it want make sense, which is why use entityos._util.hex.CBORtoArray to convert it!
					
					wallet.getBalance().then(function(dataAsCBORHex)
					{
						console.log('CBOR(Hex): ' + dataAsCBORHex)

						var data = entityos._util.hex.CBORtoArray(dataAsCBORHex);

						// [12] The base Cardano currency is a "lovelace". 1,000,000 lovelace = 1 ADA.
						// Named after Ada Lovelace the first programmer (female)

						// The lovelace (i.e. ADA) is stored in the first array position (index 0)
						// !! NOTE: If no other assets then it is not in an array it is the data value !!

						var lovelace;

						if (_.isArray(data))
						{
							lovelace = _.first(data)
						}
						else
						{
							lovelace = data;
						}

						console.log('- which decodes to:');
						console.log(parseInt(lovelace) + ' Lovelace / ' + parseInt(lovelace) / 1000000 + ' ADA\n\n');

						_wallet.lovelace = lovelace;
						_wallet.ada = parseInt(lovelace) / 1000000;

						// The other assets e.g. NFTs, Native-Tokens are stored in the 2nd array position (index 1)

						console.log('Other Digital Assets In The Wallet:');
						var otherAssets = data[1];
						console.log(otherAssets);

						var _otherAssets = {};

						// [13] Go through each of the other assets and decode their names using entityos._util.convert.charCodesToText function

						if (otherAssets != undefined)
						{
							_.each(otherAssets, function (otherAssetValue, otherAssetKey)
							{
								_.each(otherAssetValue, function  (_otherAssetValue, _otherAssetKey)
								{
									_otherAssets[entityos._util.convert.charCodesToText(_otherAssetKey)] = _otherAssetValue;
								});
							});

							console.log('- which decodes to:');
							console.log(_otherAssets);
						}

						var learnWalletAssetsView = eos.view();

						learnWalletAssetsView.add(
						[
							'<div style="border-radius: 6px; padding:16px;" class="alert-white w-md-50 mt-6 border mt-4">',
								'<div style="font-family: PT Mono, monospace; font-size: 1.65rem; color:#1133AD;" class="fw-bold mb-1">',
									(parseInt(lovelace) / 1000000), ' ADA',
								'</div>'
						]);

						var _otherAssetsOrdered = {};   
						_(_otherAssets).keys().sort().each(function (key) {
						_otherAssetsOrdered[key] = _otherAssets[key];
						});

						_.each(_otherAssetsOrdered, function (_otherAssetValue, _otherAssetKey)
						{
							learnWalletAssetsView.add(
							[
								'<div style="font-family: PT Mono, monospace; font-size: 1rem;" class="">',
									_otherAssetKey, ' | ', _otherAssetValue, 
								'</div>'
							]);
						});

						_wallet.otherAssets = _otherAssetsOrdered;

						learnWalletAssetsView.add('</div>');

						learnWalletAssetsView.render('#wallet-view');

						if (showAll)
						{
							eos.invoke('wallet-transactions', param);
						}
					});
				});
			}
			else
			{
				console.log('!! Invalid wallet.')
			}
        }
	},
	{
		name: 'wallet-transactions',
		code: function (param)
		{
			console.log('## Get & Show Wallet Transactions:')

			var _wallet = eos.get({scope: 'wallet', context: '_wallet'});
         	var walletName = eos.get({scope: 'wallet', context: 'wallet-name'});
			
            window.cardano[walletName].enable().then(function (wallet)
            {
                console.log(wallet);

				var uxtos = [];
				
                wallet.getUtxos().then(function(dataAsCBORHex)
                {
                    console.log('UXTOs Data:')

					var _dataAsCBORHex = _.split(dataAsCBORHex, ',')
					console.log(_dataAsCBORHex);

					_.each(_dataAsCBORHex, function (__dataAsCBORHex)
					{
						var _uxto = {};

						var _data = _.split(__dataAsCBORHex, '8258390');
						console.log('-- Transaction:');

						var txID = _.replace(_.first(_data), '82825820', '')
						_uxto['id'] = _.join(_.slice(txID, 0, -2), '');

						console.log('#' + parseInt(_.join(_.slice(txID,-2), '')));
						_uxto['index'] = parseInt(_.join(_.slice(txID,-2), ''));

						var data = entityos._util.hex.CBORtoArray(__dataAsCBORHex);
						console.log('--')
						var dataTransaction = data[1][1];

						if (!_.isArray(dataTransaction))
						{
							console.log(dataTransaction);
							_uxto['assets'] = {cardano: {lovelace: dataTransaction}};
							_uxto['_assets'] = {name: 'lovelace', qty: dataTransaction};
						}
						else
						{
							console.log(dataTransaction[0]);

							_uxto['assets'] =
							{
								cardano: {lovelace: dataTransaction[0]}
							};

							 _.each(dataTransaction[1], function  (_transactionValue, _transactionKey)
                            {
								var _asset = {};
								const charCodes = _.split(_transactionKey, ',');
								const uint8Array = new Uint8Array(charCodes);

								console.log('chars:' + charCodes)
								// Convert Uint8Array to hex string
								let hexString = '';
								uint8Array.forEach((byte) => {
									hexString += byte.toString(16).padStart(2, '0');
								});

								dataTransaction[1][hexString] = _transactionValue;

								_uxto['assets'][hexString] = {};
								_asset['policy'] = hexString;

								_.each(dataTransaction[1][_transactionKey], function (_transactionValueValue, _transactionValueKey)
								{
									dataTransaction[1][_transactionKey][entityos._util.convert.charCodesToText(_transactionValueKey)] = _transactionValueValue;

									_uxto['assets'][hexString][entityos._util.convert.charCodesToText(_transactionValueKey)] = _transactionValueValue;

									_asset['name'] = entityos._util.convert.charCodesToText(_transactionValueKey);
									_asset['qty'] = _transactionValueValue;
								});

								_uxto['_assets'] = _.clone(_asset);
                            });
						}
						uxtos.push(_uxto);
					})
                   
					console.log(uxtos);

					_wallet.uxtos = uxtos;

					eos.invoke('wallet-network', param)
                });
            });
        }
	},
	{
		name: 'wallet-network',
		code: function (param)
		{
			console.log('## Get & Show Wallet Network:')

         	var walletName = eos.get({scope: 'wallet', context: 'wallet-name'});
			var _wallet = eos.get({scope: 'wallet', context: '_wallet'});
			
            window.cardano[walletName].enable().then(function (wallet)
            {
				wallet.getNetworkId().then(function(data)
				{
					console.log('NetworkID: ' + data);
					_wallet.networkID = data

					eos.invoke('wallet-used-addresses', param);
				});
			});
		}
	},
	{
		name: 'wallet-used-addresses',
		code: function (param)
		{
			console.log('## Get & Show Wallet Change Address:')

         	var walletName = eos.get({scope: 'wallet', context: 'wallet-name'});
			var _wallet = eos.get({scope: 'wallet', context: '_wallet'});

            window.cardano[walletName].enable().then(function (wallet)
            {
				wallet.getUsedAddresses().then(function(addressesData)
				{
					var _usedAddresses = [];

					_.each(addressesData, function (addressData)
					{
						console.log(addressData);

						var _usedAddress = typhonjs.utils.getAddressFromHex(addressData);

						var _usedAddressData = 
						{
							_data: _usedAddress
						}
						
						_usedAddressData.address = _usedAddressData._data.addressBech32;
						_usedAddresses.push(_usedAddressData);
					});

					console.log(_usedAddresses)

					_wallet.addresses = {used: _usedAddresses}

					eos.invoke('wallet-show', param)
				});
			});
		}
	},
	{
		name: 'wallet-show',
		code: function (param)
		{
			console.log('## Show Wallet:')

			var _wallet = eos.get({scope: 'wallet', context: '_wallet'});

			console.log(_wallet);
		}
	}
]);

	

// Show more functions - next one: wallet.getUtxos().then(function(data) {});
// THEN:
// .getChangeAddress(), getRewardAddresses(), .getUnusedAddresses()
// .signTx(), .submitTx()

/* .signData():

- entityOS.cloud User UUID
- Link wallet public key to user account
- Send user 6 digit code
- User signs 6 digit code using wallet private key (protected by password)
- Sends back to entityOS,cloud and using public key checks the hash

.signTX / .submitTx

- user sets public key (cardano address) against their entityOS.cloud profile
- to verify that it is there address using wallet.slfdrvn.app they send a transaction to it as SDI with specifi UUID in it.
- entityOS.cloud then checks the Cardano network to see if NFT with specific code exists and then verifies when present.
	binding the entityOS,cloud (web2) account to th3 Cardano (web3) account (stake address)

Trusted logon
- to auth for web2 using web3
- to view data in web3 wallet from web2 (entityOS) ie show me my overdue todos (tasks)

- LOGON_GET_AUTHENTICATION_LEVEL
- Using returned logonkey, using web3 wallet sign the logonkey
- Send back to get a trusted key (which can be converted to SID) [OAuth]
- Then to say entityos.cloud.search({object: 'project_task', sid: ...})

wallet.slfdrvn.app
- Browser extension
- Work with Lace
- Can have own trusted authentication service:
	user sends in signed data that is checked against linked wallet etc

- store locally - use the web3 wallet to encrypt data locally.
	signData and then store locally
-- web3 has a password that is protecting the privatekey associated with the public key (Cardano address)

- create wallet and store seed key against account.
- with backu up

*/

// Check out https://buildingoncardano.dev for lot's of Dev Resources, Tools etc!

$(function ()
{
	//Just a little break to make sure all the wallets have finished initialising.
    setTimeout(walletInit, 2000);
});

function walletInit()
{
    eos.invoke('wallet-init');
	entityos._util.factory.core();
	//entityos._util.factory.protect();
	//entityos._util.factory.local();
}