import {
  POST_CARD_FIELDS,
  AUTHOR_FIELDS,
  CATEGORY_FIELDS,
  TAG_FIELDS,
  POST_SEO_FIELDS,
  AEO_FIELDS,
  IMAGE_FIELDS,
} from "./fragments";

export const GET_ALL_POSTS = `
  ${POST_CARD_FIELDS}
  query GetAllPosts($first: Int = 100, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ...PostCardFields
      }
    }
  }
`;

export const GET_ALL_POSTS_FOR_SITEMAP = `
  query GetAllPostsForSitemap($first: Int = 1000, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        modified
        date
        title
        categories {
          nodes {
            slug
            name
          }
        }
      }
    }
  }
`;

export const GET_RECENT_POSTS_FOR_NEWS_SITEMAP = `
  query GetRecentPostsForNewsSitemap {
    posts(first: 50, where: { status: PUBLISH, dateQuery: { after: { year: 0, month: 0, day: 0 } } }) {
      nodes {
        slug
        date
        modified
        title
        categories {
          nodes {
            slug
            name
          }
        }
      }
    }
  }
`;

export const GET_POST_BY_SLUG = `
  ${IMAGE_FIELDS}
  ${AUTHOR_FIELDS}
  ${CATEGORY_FIELDS}
  ${TAG_FIELDS}
  ${POST_SEO_FIELDS}
  ${AEO_FIELDS}
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      slug
      excerpt
      content
      date
      modified
      status
      featuredImage {
        node {
          ...ImageFields
        }
      }
      author {
        node {
          ...AuthorFields
        }
      }
      categories {
        nodes {
          ...CategoryFields
          ancestors {
            nodes {
              name
              slug
            }
          }
        }
      }
      tags {
        nodes {
          ...TagFields
        }
      }
      seo {
        ...PostSEOFields
      }
      ...AEOFields
    }
  }
`;

export const GET_POSTS_BY_CATEGORY = `
  ${POST_CARD_FIELDS}
  query GetPostsByCategory($slug: String!, $first: Int = 12, $after: String) {
    category(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      count
      posts(first: $first, after: $after, where: { status: PUBLISH }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...PostCardFields
        }
      }
    }
  }
`;

export const GET_POSTS_BY_TAG = `
  ${POST_CARD_FIELDS}
  query GetPostsByTag($slug: String!, $first: Int = 12, $after: String) {
    tag(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      count
      posts(first: $first, after: $after, where: { status: PUBLISH }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...PostCardFields
        }
      }
    }
  }
`;

export const GET_POSTS_BY_AUTHOR = `
  ${POST_CARD_FIELDS}
  query GetPostsByAuthor($slug: String!, $first: Int = 12, $after: String) {
    user(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      avatar {
        url
      }
      posts(first: $first, after: $after, where: { status: PUBLISH }) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ...PostCardFields
        }
      }
    }
  }
`;

export const GET_AUTHOR = `
  query GetAuthor($slug: String!) {
    user(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      avatar {
        url
      }
    }
  }
`;

export const GET_CATEGORIES = `
  ${CATEGORY_FIELDS}
  query GetCategories($first: Int = 100) {
    categories(first: $first, where: { hideEmpty: true }) {
      nodes {
        ...CategoryFields
        children {
          nodes {
            ...CategoryFields
          }
        }
      }
    }
  }
`;

export const GET_TAGS = `
  ${TAG_FIELDS}
  query GetTags($first: Int = 200) {
    tags(first: $first, where: { hideEmpty: true }) {
      nodes {
        ...TagFields
      }
    }
  }
`;

export const SEARCH_POSTS = `
  ${IMAGE_FIELDS}
  ${CATEGORY_FIELDS}
  query SearchPosts($query: String!, $first: Int = 10, $after: String) {
    posts(
      first: $first
      after: $after
      where: { search: $query, status: PUBLISH }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        title
        slug
        excerpt
        date
        featuredImage {
          node {
            ...ImageFields
          }
        }
        categories {
          nodes {
            ...CategoryFields
          }
        }
      }
    }
  }
`;

export const GET_RELATED_POSTS = `
  ${POST_CARD_FIELDS}
  query GetRelatedPosts($categoryId: Int!, $notIn: [ID!], $first: Int = 4) {
    posts(
      first: $first
      where: {
        status: PUBLISH
        categoryId: $categoryId
        notIn: $notIn
      }
    ) {
      nodes {
        ...PostCardFields
      }
    }
  }
`;

export const GET_HOMEPAGE_POSTS = `
  ${POST_CARD_FIELDS}
  query GetHomepagePosts {
    featuredPosts: posts(first: 1, where: { status: PUBLISH }) {
      nodes {
        ...PostCardFields
      }
    }
    latestPosts: posts(first: 9, where: { status: PUBLISH }) {
      nodes {
        ...PostCardFields
      }
    }
    categories(first: 6, where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

export const GET_ALL_AUTHORS_FOR_SITEMAP = `
  query GetAllAuthorsForSitemap {
    users(first: 100, where: { hasPublishedPosts: POST }) {
      nodes {
        slug
      }
    }
  }
`;
