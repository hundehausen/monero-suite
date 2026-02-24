# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.1.0](https://github.com/hundehausen/monero-suite/compare/v1.0.0...v1.1.0) (2026-02-24)


### Features

* add TOML language support for code highlighting in EnvPreview ([db750f4](https://github.com/hundehausen/monero-suite/commits/db750f4c96eb1c8d61ef1a48cb00a8cc1c80aada))
* disable download button when placeholder domain is set ([bc5492c](https://github.com/hundehausen/monero-suite/commits/bc5492cc90d52010ce9c15b1d478552d37097a25))
* enable reverse proxy per service ([957df9d](https://github.com/hundehausen/monero-suite/commits/957df9d29607b02eaaadc6a97feda4478901d9c5))
* ux improvements ([38c6fa1](https://github.com/hundehausen/monero-suite/commits/38c6fa11c69dfa13fb74bf5e84de6188c6025f94))

### Chore

* fix security vulnerabilities ([c2bd2ce](https://github.com/hundehausen/monero-suite/commits/c2bd2ce95c59507c604e4c682e8a9edbcf25f71b))


## [1.0.0](https://github.com/hundehausen/monero-suite/compare/v0.7.0...v1.0.0) (2026-02-07)


### Features

* major refactoring with Claude Code
* support for all linux distros that support docker and docker compose
* fully preview of the generated script
* selected services highlighted accoridion item
* input validation
* docker compose and .env file are now embedded in the generated script with heredoc syntax
* manually download docker-compose.yml file

### Chore
* update dependencies to latest versions
* security hardening
* bug fixes and improvements, espeacially on the UX side

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
