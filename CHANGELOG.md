# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.2.0](https://github.com/hundehausen/monero-suite/compare/v1.1.0...v1.2.0) (2026-02-25)


### Features

* conditionally show hidden services ([52155b3](https://github.com/hundehausen/monero-suite/commits/52155b364f2dc3a685060c15718c0bd3f3c91fb1))
* more accessible info popovers ([1483d6f](https://github.com/hundehausen/monero-suite/commits/1483d6fd33a378f0c30fc7f8aa73777a950a735d))
* tabbed layout ([6b0e3b1](https://github.com/hundehausen/monero-suite/commits/6b0e3b1f6395859553bab90dd6bf66963268b379))


### Chore

* advancedConfigModal only logging section expanded by default ([1b7ed7d](https://github.com/hundehausen/monero-suite/commits/1b7ed7d5db35a8158258f9f381791477f4e2808a))
* improve texts ([9949cef](https://github.com/hundehausen/monero-suite/commits/9949cefceda0371ede684ba806cc9c0f8b53c62b))

## [1.1.0](https://github.com/hundehausen/monero-suite/compare/v1.0.0...v1.1.0) (2026-02-24)


### Features

* enable reverse proxy per service ([957df9d](https://github.com/hundehausen/monero-suite/commits/957df9d29607b02eaaadc6a97feda4478901d9c5))
* ux improvements ([38c6fa1](https://github.com/hundehausen/monero-suite/commits/38c6fa11c69dfa13fb74bf5e84de6188c6025f94))
* disable download button when placeholder domain is set ([bc5492c](https://github.com/hundehausen/monero-suite/commits/bc5492cc90d52010ce9c15b1d478552d37097a25))
* add download button for docker-compose and .env files ([a10fe5a](https://github.com/hundehausen/monero-suite/commits/a10fe5a3fbbdb4c5645f2e7fb2084d7c90b4992a))
* enhance service domain management and add tx-proxy noise option ([ae851f6](https://github.com/hundehausen/monero-suite/commits/ae851f6f1fd80d18c8dd161a67d4eb72239ecb4a))


### Bug Fixes

* adjust styles for ExplainingLabel component ([b37e173](https://github.com/hundehausen/monero-suite/commits/b37e173e9c2643bfa28081de601d0b6716a147d6))


### Code Refactoring

* bash commands are generated server-side from boolean flags ([13ce579](https://github.com/hundehausen/monero-suite/commits/13ce579de6520814a7247a0594cf6a3bbd8be587))
* update Node.js version to 24.x in release workflow ([b70057d](https://github.com/hundehausen/monero-suite/commits/b70057d1c33e6ad2f1694dda81dbf1b45dd042c9))
* remove unused Anchor import in MoneroNodeSection component ([3f2ad1e](https://github.com/hundehausen/monero-suite/commits/3f2ad1e29ab4765da72057fa8e1d9c05122d2353))


### Chore

* fix security vulnerabilities ([c2bd2ce](https://github.com/hundehausen/monero-suite/commits/c2bd2ce95c59507c604e4c682e8a9edbcf25f71b))
* use latest image tags ([8106836](https://github.com/hundehausen/monero-suite/commits/8106836053b77dcfe124f8b6e308c3ea1cc8c988))
* update and document anonymity networks ([bc650b0](https://github.com/hundehausen/monero-suite/commits/bc650b0565007c4626cd13928d5959b337fc4159))
* improve texts and descriptions ([7745d2e](https://github.com/hundehausen/monero-suite/commits/7745d2e5b529f45363c7a8827762b5de0de8db92))
* nextjs eslint migration ([25ef2e4](https://github.com/hundehausen/monero-suite/commits/25ef2e47c4454248acf1b963374ff560b555ce3b))
* update service ports and daemon addresses to use constants for better maintainability ([f2afe5d](https://github.com/hundehausen/monero-suite/commits/f2afe5d36c023b7e7ed3aac8991a2c1ef096f50a))
* update deps ([a18f4be](https://github.com/hundehausen/monero-suite/commits/a18f4bea2c21deb6cc33beba7040535f230d503e))
* revert react-toggle-dark-mode v2 ([d0e8bd6](https://github.com/hundehausen/monero-suite/commits/d0e8bd6e2bf1cd7631775c4fcbe6f3faf8f0dc39))


## [1.0.0](https://github.com/hundehausen/monero-suite/compare/v0.7.0...v1.0.0) (2026-02-07)


### Features

* support more linux distros ([acfa44b](https://github.com/hundehausen/monero-suite/commits/acfa44b7163e2bff01d3ad2ca97c2534afb7498e))
* switch to nickfedor/watchtower ([622acf6](https://github.com/hundehausen/monero-suite/commits/622acf691b74bc73129023e720c937bc47388aa3))
* set MRL ban list per default in config ([d5b33e1](https://github.com/hundehausen/monero-suite/commits/d5b33e126ced72088c1ce509c4202c40676c9fd5))
* add TOML language support for code highlighting in EnvPreview ([db750f4](https://github.com/hundehausen/monero-suite/commits/db750f4c96eb1c8d61ef1a48cb00a8cc1c80aada))


### Bug Fixes

* correct typo in explanation for Pruned Node ([dd5673e](https://github.com/hundehausen/monero-suite/commits/dd5673e13319bd2881a0496920aadbdc74a82afa))
* support multiple custom addPeers, addPriorityNode, addExclusiveNode ([6b99367](https://github.com/hundehausen/monero-suite/commits/6b99367871cf8641dfded0104d2edc036c22964a))
* remove redundant restricted-rpc ([bb6d9c1](https://github.com/hundehausen/monero-suite/commits/bb6d9c1c62ea239b982e22b4841b8a0ff576805d))
* use new path of tor volume mapping ([a7666b6](https://github.com/hundehausen/monero-suite/commits/a7666b64ac4831736cff76cdd84a8fdc1960ea0a))


### Code Refactoring

* streamline Traefik configuration handling across services ([3de74c1](https://github.com/hundehausen/monero-suite/commits/3de74c112fdcd040d9a51c1e3a9c3761762c3e4b))
* simplify state return structure in service hooks ([6c1075a](https://github.com/hundehausen/monero-suite/commits/6c1075adfcf7df281a837be2e1c89347c702117c))
* optimize service checks and memoize script generation logic ([bc83d83](https://github.com/hundehausen/monero-suite/commits/bc83d831985c0fdc8f96fdd58a49de6722d1b5b2))
* enhance blob cleanup logic with detailed response and error handling ([a66d663](https://github.com/hundehausen/monero-suite/commits/a66d663c0ed19f9ccd8c11b81fd10272dd9f3df2))
* update README ([0843946](https://github.com/hundehausen/monero-suite/commits/0843946c74d0a3e6121cb6120d6e7bd32e9442a5))


### Chore

* refactor installation script generation and UI components ([3978f3a](https://github.com/hundehausen/monero-suite/commits/3978f3ab933c62c8e1edb02796495ceb1ae1ab87))
* security improvements ([6db7c84](https://github.com/hundehausen/monero-suite/commits/6db7c84b6fc309471207d6d3646283cc27019041))
* update Content Security Policy to enhance security settings ([ee158b8](https://github.com/hundehausen/monero-suite/commits/ee158b8acac299a25c43c550d93b02a97cc61bcd))
* refactor service hooks to centralize constants and improve code organization ([8a18a77](https://github.com/hundehausen/monero-suite/commits/8a18a7749b7f8773a0a8f15a62d6ccc0a4f8486c))
* improve configuration ([de48001](https://github.com/hundehausen/monero-suite/commits/de480016dbe2473ea4a034570be22a667712835e))
* upgrade action-gh-release to version 2 in release workflow ([a4b1ec9](https://github.com/hundehausen/monero-suite/commits/a4b1ec9a55b1e962fd4eb726c3a013ab3b62543a))
* update watchtower image ([c85cf98](https://github.com/hundehausen/monero-suite/commits/c85cf9851f05a140b4a5ccf6618604495254e7eb))
* update Portainer service description to include dynamic domain handling ([f62311b](https://github.com/hundehausen/monero-suite/commits/f62311b2ac25019758ce46be530f575681c67982))
* improved README ([b22754e](https://github.com/hundehausen/monero-suite/commits/b22754e79c3139dfccd9eaa6f6edf847a3eedc50))
* remove terminal file ([991d28a](https://github.com/hundehausen/monero-suite/commits/991d28ab011520eb3582334e4248aef17c890345))
* update deps and add pnpm workspace config ([9e2e7cd](https://github.com/hundehausen/monero-suite/commits/9e2e7cd6df8a678295ae51c64dd3320f1a46f2f4))
* update deps and improve README description ([4b6e426](https://github.com/hundehausen/monero-suite/commits/4b6e426e8d1bf391d8e17be8f843d91930fb6e1f))
* update dependencies ([8557855](https://github.com/hundehausen/monero-suite/commits/85578554f3f598475fefb1a87283f520b32ea17c))
* update deps ([8277aec](https://github.com/hundehausen/monero-suite/commits/8277aecf3ca9cdbd26458d201266fc6ee517e7b8))
* update deps ([37cf99b](https://github.com/hundehausen/monero-suite/commits/37cf99bd0e9e1587d3797d71f15032f15777cdb3))
* update deps ([aa98da6](https://github.com/hundehausen/monero-suite/commits/aa98da6042c8c34de6bfab6f512d3adf9b6db59d))
* update deps ([0d21a3d](https://github.com/hundehausen/monero-suite/commits/0d21a3d125635018a4ba410393b0b7ad328585f9))
* update deps ([6d0ea5f](https://github.com/hundehausen/monero-suite/commits/6d0ea5ffd72bfa157171277440250b5de28095c5))
* update deps ([301afa6](https://github.com/hundehausen/monero-suite/commits/301afa6bfd94690f98e8ce1a1807f542bb519177))
* update deps ([c251023](https://github.com/hundehausen/monero-suite/commits/c25102337d9382cc942acf45db9d437f33833b5d))
* update deps ([54aef3f](https://github.com/hundehausen/monero-suite/commits/54aef3f6fe6914485d5142c7c674466b809e6dc4))
* update deps ([3d19eb3](https://github.com/hundehausen/monero-suite/commits/3d19eb368e95cf7153d0b0b2a53972084509064e))
* update deps ([8bd1eb2](https://github.com/hundehausen/monero-suite/commits/8bd1eb220c52c80ca920b43cfa7ae735453183b7))
* update deps ([cb2ef2e](https://github.com/hundehausen/monero-suite/commits/cb2ef2ecc6358ec5852cd5b8fa180930baf70759))
* update deps ([adc1486](https://github.com/hundehausen/monero-suite/commits/adc1486cf2235f7878ae87c1ee9b22d23361d7b9))
* update deps ([3bc6620](https://github.com/hundehausen/monero-suite/commits/3bc66208254bf0b57a1926ef5ed44f72c00b94ee))
* update deps ([d5d8f8b](https://github.com/hundehausen/monero-suite/commits/d5d8f8b5fa3662ed2e76f8443a07db0aae366101))
* update deps ([2be5e2d](https://github.com/hundehausen/monero-suite/commits/2be5e2d806a2031c62502babc408091a716cfb8d))
* update deps ([86832f8](https://github.com/hundehausen/monero-suite/commits/86832f809af7ace6f96cbbfe95c6a59f457790a6))


## [0.7.0](https://github.com/hundehausen/monero-suite/compare/v0.5.0...v0.7.0) (2025-03-25)


### Features

* add cuprate experimental ([7d27516](https://github.com/hundehausen/monero-suite/commits/7d2751622cb9d773441261bdcca30cb6d189e707))
* advanced monero configuration ([e7bf621](https://github.com/hundehausen/monero-suite/commits/e7bf621b8714446a8d18bfd14c48a501afbd7430))
* advanced monero configuration ([c89c869](https://github.com/hundehausen/monero-suite/commits/c89c8696265741ed537227e1167d869affa85f0c))


### Bug Fixes

* fix cuprate port localhost binding ([c9f43a5](https://github.com/hundehausen/monero-suite/commits/c9f43a5c38131a852719f801e5e54de0d9a6522b))
* p2pool mini not applied ([08e8997](https://github.com/hundehausen/monero-suite/commits/08e8997f2577f212dd63042b2d1a0bc2c22145d1))


### Chore

* add small note for different p2p host port mapping for cuprate ([f2d8341](https://github.com/hundehausen/monero-suite/commits/f2d8341427c066011a5f0a7f5ad47f78ec8eb7e1))
* custom AccordionItem component ([bc04ca9](https://github.com/hundehausen/monero-suite/commits/bc04ca991336e95328fac72e96849231d8ef3eb1))
* refactor monerod service ([ccc1cf0](https://github.com/hundehausen/monero-suite/commits/ccc1cf08646cb403e42ed8e555ba1e81c4395e3a))
* remove unused code ([1d3457f](https://github.com/hundehausen/monero-suite/commits/1d3457f2bbe41b330ac2442873671de1e75a541a))
* update dependecies ([a35cea7](https://github.com/hundehausen/monero-suite/commits/a35cea734f2231df962059b7aa478526ad74a987))
* update next ([8127d20](https://github.com/hundehausen/monero-suite/commits/8127d20ab155f3ca05b7a923dcefadd865fba679))

## [0.6.0](https://github.com/hundehausen/monero-suite/compare/v0.5.0...v0.6.0) (2025-03-05)


### Features

* advanced monero configuration ([c89c869](https://github.com/hundehausen/monero-suite/commits/c89c8696265741ed537227e1167d869affa85f0c))


### Chore

* remove unused code ([1d3457f](https://github.com/hundehausen/monero-suite/commits/1d3457f2bbe41b330ac2442873671de1e75a541a))

## [0.5.0](https://github.com/hundehausen/monero-suite/compare/v0.4.0...v0.5.0) (2025-03-03)


### Features

* new tor service, workaround for proxy in docker network ([ed1191b](https://github.com/hundehausen/monero-suite/commits/ed1191bd9c44829afc035419d62a85833e9ee2e6))
* use new modern tor image ([9272592](https://github.com/hundehausen/monero-suite/commits/9272592ce9fa99f77aea7319d21c714d5014af40))


### Bug Fixes

* ensure TextInput is a controlled component ([1cc04d6](https://github.com/hundehausen/monero-suite/commits/1cc04d683ec762e136a9846b2cd090837e4601d8))


### Documentation

* clarify network mode description for service port exposure ([ea10055](https://github.com/hundehausen/monero-suite/commits/ea1005563b796daf1c6872641246174bed684f2c))


### Chore

* update dependencies to latest versions ([5c73b7b](https://github.com/hundehausen/monero-suite/commits/5c73b7beae0eb2340e03a558354b4cecfe511327))
* update network section description ([3c90925](https://github.com/hundehausen/monero-suite/commits/3c909258185d52223a10f00cda7cc210787ba8ea))
* upgrade Next.js and related dependencies to version 15.2.0 ([0f3fe15](https://github.com/hundehausen/monero-suite/commits/0f3fe15ef0610abdc93746de41740b79ad4ba0ff))

## [0.4.0](https://github.com/hundehausen/monero-suite/compare/v0.3.1...v0.4.0) (2025-02-25)


### Features

* add dynamic domain configuration for Traefik services ([b3aff65](https://github.com/hundehausen/monero-suite/commits/b3aff65b9ee1b906ae70adefd2ab171022613c30))
* add Mantine HTML props to root layout to suppress hydration error message ([e0c515c](https://github.com/hundehausen/monero-suite/commits/e0c515c78d76b718765fa4cdd67ab486ab25b597))
* improve config upload state management ([1885371](https://github.com/hundehausen/monero-suite/commits/18853712effbe9737986d2dacc0f8bdcdbaaef3d))
* update Architecture section label to specify CPU ([5542856](https://github.com/hundehausen/monero-suite/commits/55428561c25c69b00dab10336b0d504c71e421c8))


### Chore

* add file size limit for uploads ([50048e9](https://github.com/hundehausen/monero-suite/commits/50048e9ba5bbf1011420d69292b38711b7574745))
* add timeout for release pipeline ([ed69423](https://github.com/hundehausen/monero-suite/commits/ed69423f87fd8a8364018526baf30b7a3d694204))
* update label to include Debian ([d8ce630](https://github.com/hundehausen/monero-suite/commits/d8ce63065f033b9fe0db4b8e34810c3facfae29c))


### Code Refactoring

* modularize services into separate hooks ([ee999bd](https://github.com/hundehausen/monero-suite/commits/ee999bd467a1279d9c76548436894e54595a2923))
* split Selection component into modular service sections ([c3135ed](https://github.com/hundehausen/monero-suite/commits/c3135edf5457593e641817d9fff09b51c8598751))

### [0.3.1](https://github.com/hundehausen/monero-suite/compare/v0.3.0...v0.3.1) (2025-02-16)


### Chore

* change favicon to sir xmr whale ([0ba9e1c](https://github.com/hundehausen/monero-suite/commits/0ba9e1c1b038e76ddddb78176f5831184c43bb7c))
* remove explicit pnpm version in release workflow ([8cf6e20](https://github.com/hundehausen/monero-suite/commits/8cf6e20ca8855acb963d5237c3ca13a714a874de))
* update dependencies and tooling ([5846075](https://github.com/hundehausen/monero-suite/commits/5846075cdf253ab76aa2cd4aea446c11d3b8931d))

## [0.3.0](https://github.com/hundehausen/monero-suite/compare/v0.2.0...v0.3.0) (2025-02-16)


### Chore

* add versioning system with standard-version ([b0873dd](https://github.com/hundehausen/monero-suite/commits/b0873dd37fffcd9e324fbbca07932d7157d8e305))
* refactoring & beautiful scipts ([ad00f31](https://github.com/hundehausen/monero-suite/commits/ad00f318c8a634850a92029dd398edac9a6c3959))
