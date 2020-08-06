const asyncHandler = require('express-async-handler');
const axios = require('axios');
const _ = require('lodash');
const RSS = require('rss');

const orgid = process.env.ORGID || null;
const bearer = process.env.BEARER || null;
const percipioSite = process.env.PERCIPIOSITE || null;
const maxItems = process.env.MAXITEMS || 20;

/**
 * Call the Percipio /content-discovery/v1/organizations/${orgid}/search-content
 *
 * @param {object} request
 * @returns {object} Axios promise
 */
const getSearchResults = async (request) => {
  let requestParams = request || {};

  const requestDefaults = {
    max: 20,
    offset: 0,
    q: request.searchTerms,
  };

  // merge opt with default config
  _.defaults(requestParams, requestDefaults);

  // Remove any nulls
  requestParams = _.omitBy(requestParams, _.isNil);

  const axiosConfig = {
    url: `https://api.percipio.com/content-discovery/v1/organizations/${orgid}/search-content`,
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
    method: 'GET',
    params: requestParams,
  };

  return axios.request(axiosConfig);
};

/**
 * Get a HTML representation of a Percipio Item
 *
 * @param {object} percipioItem - The Percipio Item from the Content Discovery response
 * @returns {string}
 */
const getPercipioItemHTML = (percipioItem) => {
  let courseInfo = null;
  if (!_.isNull(percipioItem.associations.parent)) {
    courseInfo = [
      '<span>From course: </span>',
      '<ul>',
      `<li class="itemCourseInfoLink"><a href="${percipioItem.associations.parent.link}" target="_blank">${percipioItem.associations.parent.title}</a></li>`,
      '</ul>',
    ].join('');
  }

  let channelInfo = null;
  if (
    !_.isNull(percipioItem.associations.channels) &&
    !_.isEmpty(percipioItem.associations.channels)
  ) {
    const channelInfoArray = ['<span>From channel: </span>', '<ul>'];

    _.forEach(percipioItem.associations.channels, (channelValue) => {
      channelInfoArray.push(
        `<li class="itemChannelInfoLink"><a href="${channelValue.link}" class="card-link" target="_blank">${channelValue.title}</a></li>`
      );
    });
    channelInfoArray.push('</ul>');

    channelInfo = channelInfoArray.join('');
  }

  const htmlDescription = [
    '<div class="itemThumbnail">',
    `<a href="${percipioItem.link}" target="_blank">`,
    `<img alt="${percipioItem.contentType.displayLabel} | ${percipioItem.localizedMetadata[0].title}" src="${percipioItem.imageUrl}?width=200" width="200">`,
    '</a>',
    '</div>',
    '<div class="itemDescription">',
    `${
      !_.isNil(percipioItem.localizedMetadata[0].description)
        ? percipioItem.localizedMetadata[0].description
        : ''
    }`,
    '</div>',
    '<div class="itemCourseInfo">',
    `${!_.isNull(courseInfo) ? courseInfo : ''}`,
    '</div>',
    '<div class="itemChannelInfo">',
    `${!_.isNull(channelInfo) ? channelInfo : ''}`,
    '</div>',
  ].join('');

  return htmlDescription;
};

/**
 * Generate the OpenSearch Response
 *
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 */
const opensearchViewAsync = asyncHandler(async (req, res) => {
  let { searchterms, startindex, count, diagnostics } = req.query;

  searchterms = searchterms || null;
  diagnostics = diagnostics || null;
  startindex = parseInt(startindex, 10) || 0;
  count = parseInt(count, 10) || maxItems;

  const request = {
    max: count,
    offset: startindex,
    q: searchterms,
  };

  let data = null;
  let headers = null;

  if (!_.isNull(searchterms)) {
    ({ data, headers } = await getSearchResults(request));
  }

  const totalRecords = headers ? parseInt(headers['x-total-count'], 10) : 0;

  res.header('Content-Type', 'application/rss+xml');

  /* lets create an rss feed */
  const feed = new RSS({
    title: 'Percipio Search',
    description: `Search results for "${searchterms}" at ${percipioSite}`,
    feed_url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    site_url: `${req.protocol}://${req.get('host')}`,
    ttl: '60',
    custom_namespaces: {
      opensearch: 'http://a9.com/-/spec/opensearch/1.1/',
      media: 'http://search.yahoo.com/mrss/',
    },
    custom_elements: [
      { 'opensearch:totalResults': totalRecords },
      { 'opensearch:startindex': startindex },
      { 'opensearch:itemsPerPage': count },
      {
        'opensearch:Query': [
          {
            _attr: {
              role: 'request',
            },
          },
          {
            _attr: {
              searchTerms: searchterms,
            },
          },
          {
            _attr: {
              startindex,
            },
          },
          {
            _attr: {
              count,
            },
          },
        ],
      },
    ],
  });

  if (!_.isNull(diagnostics)) {
    feed.item({
      title: 'dia',
      description: JSON.stringify(req.query),
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    });
  }
  _.forEach(data, (value) => {
    feed.item({
      title: `${value.contentType.displayLabel} | ${value.localizedMetadata[0].title}`,
      description: getPercipioItemHTML(value),
      url: value.link,
      author: _.join(value.by, ','),
      custom_elements: [
        {
          'media:thumbnail': [
            {
              _attr: {
                url: value.imageUrl,
              },
            },
          ],
        },
      ],
      categories: [value.contentType.displayLabel],
    });
  });

  res.send(feed.xml({ indent: '\t' }));
});

module.exports = {
  opensearchViewAsync,
};
