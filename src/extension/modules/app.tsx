import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

import { fetchGetReviews, fetchGetReviewsOverview } from '../apis';
import { getAsin } from '~utils';
// import { log } from 'console';
// import { comment } from 'postcss';

// import { transformReviewOverviewFromString } from './utils/parser';
// import { DATA_REVIEW_OVERVIEW } from './data-samples/review-overview';
// import { DATA_REVIEW_01 } from './data-samples/review-01';

interface OverviewModel {
  ratings?: number;
  reviews?: number;
}

const AppContent = () => {
  const [overview, serOverview] = useState<OverviewModel>({});

  const initialize = () => {
    // const res = transformReviewOverviewFromString(DATA_REVIEW_OVERVIEW);
    // serOverview(res);
    // return;
    fetchGetReviewsOverview({ asin: getAsin() as string })
      .then(res => {
        serOverview(res);
      })
      .catch(err => {
        console.log(err);
      });
  };
  useEffect(() => {
    initialize();
  }, []);
  const handleComments = async () => {
    // return console.log(transformReviews(DATA_REVIEW_01));
    const params = {
      asin: getAsin() as string,
      pageNumber: 1
    };
    const res = await fetchGetReviews(params);
    console.log(res);
  };
  return (
    <div className="amazon-slot-app">
      <div>Asin: {getAsin()}</div>
      <div>Ratings: {overview.ratings}</div>
      <div>Reviews: {overview.reviews}</div>
      <Button size="small" variant="contained" onClick={handleComments}>
        {/* {chrome.i18n.getMessage('esense_content_reviews')} */}
        分析评论
      </Button>
    </div>
  );
};

export default AppContent;
