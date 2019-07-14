# node-percipio-opensearch
This package makes it easy to search for content on your Percipio Site using [OpenSearch](http://www.opensearch.org/Home)

The response is an RSS 2.0 formatted response

## Requirements

1. A publically accessible server running node.js (or ability to reverse proxy back to your node server) - for testing you can use [ngrok](https://ngrok.com/)
1. A Skillsoft [Percipio](https://www.skillsoft.com/platform-solution/percipio/) Site
1. A [Percipio Service Account](https://documentation.skillsoft.com/en_us/pes/3_services/service_accounts/pes_service_accounts.htm) with permission for accessing [CONTENT DISCOVERY API](https://documentation.skillsoft.com/en_us/pes/2_understanding_percipio/rest_api/pes_rest_api.htm)

## Configuration
Once you have copied this repository set the following NODE ENV variables:

| ENV | Derscription |
| --- | --- |
| PERCIPIOSITE | This is the Base URI for your Percipio site (i.e. https://{customer}.percipio.com) |
| CUSTOMER_ORGID | This is the Percipio Organiation UUID for your Percipio Site |
| CUSTOMER_BEARER | This is the Percipio Bearer token for a Service Account with permissions for CONTENT DISCOVERY services. |

## How to use it

You can use the Opensearch app to search your Percipio site.

The OpenSearch URL is the hostname where you host the application followed by /opensearch (i.e http://myserver.public.internet/opensearch)

### Parameters

The app will accept the following parameters as defined in the [specification](https://github.com/dewitt/opensearch/blob/master/opensearch-1-1-draft-6.md#opensearch-11-parameters)

| Parameter | Derscription |
| --- | --- | 
| `searchTerms` | The keyword or keywords to search for |
| `count` | The number of results to returns. DEFAULT: 20 |
| `startIndex` | Replaced with the index of the first search result desired, zero based value DEFAULT:0 |

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information what has changed recently.
