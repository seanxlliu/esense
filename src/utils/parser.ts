/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as cheerio from 'cheerio';

export const transformReviewOverviewFromString = (content: string) => {
  const $ = cheerio.load(content.replace(/\s\s+/g, '').replace(/\\n/g, ''));
  // Total ratings/reviews
  const reviewAndRating = $('[data-hook="cr-filter-info-review-rating-count"]');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore: Unreachable code error
  const reviewAndRatingStr = reviewAndRating?.[0]?.children?.[0]?.data;
  const [ratings, reviews] = (reviewAndRatingStr ?? '').match(/(\d+,?\d*)/g);
  return { ratings, reviews };
};

export const transformReviewsFromString = (content: string) => {
  const $ = cheerio.load(
    content.replace(/\s\s+/g, '').replace(/\\n/g, '').replace(/\\"/g, '')
  );
  const reviews: Record<string, any> = [];

  // 移除隐藏元素
  $('.a-popover-preload').remove();

  /* Rating */
  const reviewListStat = $('[data-hook="review"] span.a-icon-alt');

  reviewListStat.each((_index, ele) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Unreachable code error
    const Rating = parseInt(ele.children[0]?.data, 10);
    reviews.push({
      Rating
    });
  });
  /* Asin */
  const reviewListAsin = $('[data-hook="review"]');
  reviewListAsin.each((index, ele) => {
    const Asin = ele.attribs.id;
    Object.assign(reviews[index], { Asin });
  });
  /* Title */
  const reviewListTitle = $('[data-hook="review-title"]');
  reviewListTitle.each((index, ele) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Unreachable code error
    const Title = ele.children[0]?.children?.[0]?.data;
    Object.assign(reviews[index], { Title });
  });
  /* Content */
  const reviewListContent = $('[data-hook="review-body"]');
  reviewListContent.each((index, ele) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore: Unreachable code error
    const Content = ele.children[0]?.children?.[0].data;
    Object.assign(reviews[index], { Content });
  });

  return reviews;
};
