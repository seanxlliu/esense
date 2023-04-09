import { transformJsonToUrlencoded, transformStreamToString } from '~utils';
import {
  transformReviewOverviewFromString,
  transformReviewsFromString
} from '~utils/parser';

const { origin } = window.location;

interface GetReviewsOverviewParams {
  asin: string;
}
/** 获取评论概览 */
export const fetchGetReviewsOverview = ({ asin }: GetReviewsOverviewParams) => {
  const querystring = transformJsonToUrlencoded({
    ie: 'UTF8',
    showViewpoints: '1',
    pageNumber: '1',
    reviewerType: 'all_reviews',
    filterByStar: 'all_stars',
    sortBy: 'recent'
  });
  return fetch(
    `${origin}/product-reviews/${asin}/ref=cm_cr_getr_d_show_all?${querystring}`,
    {
      method: 'GET'
    }
  )
    .then(rb => {
      if (rb.status !== 200 || !rb.body) {
        throw new Error('fetchGetReviewsOverview failed');
      }
      return transformStreamToString(rb.body);
    })
    .then(res => {
      return transformReviewOverviewFromString(res);
    });
};

interface GetReviewsParams {
  asin: string;
  pageNumber: number;
}
/** 获取评论分页数据 */
export const fetchGetReviews = ({ asin, pageNumber }: GetReviewsParams) => {
  const paramstring = new URLSearchParams({
    asin,
    pageNumber: pageNumber.toString(),
    scope: 'reviewsAjax1',
    deviceType: 'desktop',
    reviewerType: 'all_reviews',
    mediaType: 'all_contents',
    pageSize: '10',
    sortBy: 'recent'
  });
  return fetch(
    `${origin}/hz/reviews-render/ajax/reviews/get/ref=cm_cr_getr_d_paging_btm_next_1`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: paramstring
    }
  )
    .then(rb => {
      if (rb.status !== 200 || !rb.body) {
        throw new Error('fetchGetReviews failed');
      }
      return transformStreamToString(rb.body);
    })
    .then(res => {
      return transformReviewsFromString(res);
    });
};
