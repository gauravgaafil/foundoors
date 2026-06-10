export const IMAGE_FIELDS = `
  fragment ImageFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
    caption
  }
`;

export const AUTHOR_FIELDS = `
  fragment AuthorFields on User {
    id
    databaseId
    name
    slug
    description
    avatar {
      url
    }
  }
`;

export const CATEGORY_FIELDS = `
  fragment CategoryFields on Category {
    id
    databaseId
    name
    slug
    description
    count
  }
`;

export const TAG_FIELDS = `
  fragment TagFields on Tag {
    id
    databaseId
    name
    slug
    description
    count
  }
`;

export const POST_SEO_FIELDS = `
  fragment PostSEOFields on PostTypeSEO {
    title
    metaDesc
    canonical
    opengraphTitle
    opengraphDescription
    opengraphImage {
      sourceUrl
      altText
      mediaDetails {
        width
        height
      }
    }
    twitterTitle
    twitterDescription
    twitterImage {
      sourceUrl
      altText
    }
    readingTime
  }
`;

export const AEO_FIELDS = `
  fragment AEOFields on Post {
    aeoFields {
      summary
      keyFacts
      whyItMatters
      sources
      faqItems
    }
  }
`;

export const POST_CARD_FIELDS = `
  ${IMAGE_FIELDS}
  ${CATEGORY_FIELDS}
  fragment PostCardFields on Post {
    id
    databaseId
    title
    slug
    excerpt
    date
    modified
    featuredImage {
      node {
        ...ImageFields
      }
    }
    author {
      node {
        name
        slug
        avatar {
          url
        }
      }
    }
    categories {
      nodes {
        ...CategoryFields
      }
    }
    tags {
      nodes {
        id
        name
        slug
      }
    }
  }
`;
