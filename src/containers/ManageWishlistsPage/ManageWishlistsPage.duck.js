import { updatedEntities, denormalisedEntities } from '../../util/data';
import { storableError } from '../../util/errors';
import { parse } from '../../util/urlHelpers';

// Pagination page size might need to be dynamic on responsive page layouts
// Current design has max 3 columns 42 is divisible by 2 and 3
// So, there's enough cards to fill all columns on full pagination pages
const RESULT_PAGE_SIZE = 42;

// ================ Action types ================ //

// export const FETCH_WISHLISTS_REQUEST = 'app/ManageWishlistsPage/FETCH_WISHLISTS_REQUEST';
// export const FETCH_WISHLISTS_SUCCESS = 'app/ManageWishlistsPage/FETCH_WISHLISTS_SUCCESS';
// export const FETCH_WISHLISTS_ERROR = 'app/ManageWishlistsPage/FETCH_WISHLISTS_ERROR';

export const FETCH_CURRENT_USER_WISHLIST_REQUEST =
  'app/ManageWishlistsPage/FETCH_CURRENT_USER_WISHLIST_REQUEST';
export const FETCH_CURRENT_USER_WISHLIST_SUCCESS =
  'app/ManageWishlistsPage/FETCH_CURRENT_USER_WISHLIST_SUCCESS';
export const FETCH_CURRENT_USER_WISHLIST_ERROR =
  'app/ManageWishlistsPage/FETCH_CURRENT_USER_WISHLIST_ERROR';

export const FETCH_CURRENT_USER_WISHLIST_LISTING_REQUEST =
  'app/ManageWishlistsPage/FETCH_CURRENT_USER_WISHLIST_LISTING_REQUEST';
export const FETCH_CURRENT_USER_WISHLIST_LISTING_SUCCESS =
  'app/ManageWishlistsPage/FETCH_CURRENT_USER_WISHLIST_LISTING_SUCCESS';
export const FETCH_CURRENT_USER_WISHLIST_LISTING_ERROR =
  'app/ManageWishlistsPage/FETCH_CURRENT_USER_WISHLIST_LISTING_ERROR';

// ================ Reducer ================ //

const initialState = {
  currentUserWishlist: null,
  currentUserWishlistError: null,
  wishlistArray: [],
  listings: [],
  currentUserWishlistListingError: null,
};

const manageWishlistsPageReducer = (state = initialState, action = {}) => {
  const { type, payload } = action;
  switch (type) {
    case FETCH_CURRENT_USER_WISHLIST_REQUEST:
      return { ...state, currentUserWishlistError: null };
    case FETCH_CURRENT_USER_WISHLIST_SUCCESS:
      return { ...state, wishlistArray: payload };
    case FETCH_CURRENT_USER_WISHLIST_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, currentUserWishlistError: payload };

    case FETCH_CURRENT_USER_WISHLIST_LISTING_REQUEST:
      return { ...state, currentUserWishlistListingError: null };
    case FETCH_CURRENT_USER_WISHLIST_LISTING_SUCCESS:
      return { ...state, listings: [...state.listings, payload] };
    case FETCH_CURRENT_USER_WISHLIST_LISTING_ERROR:
      console.error(payload); // eslint-disable-line
      return { ...state, currentUserWishlistListingError: payload };

    default:
      return state;
  }
};

export default manageWishlistsPageReducer;

// ================ Action creators ================ //

const fetchCurrentUserWishlistRequest = () => ({
  type: FETCH_CURRENT_USER_WISHLIST_REQUEST,
});

export const fetchCurrentUserWishlistSuccess = wishlist => ({
  type: FETCH_CURRENT_USER_WISHLIST_SUCCESS,
  payload: wishlist,
});

const fetchCurrentUserWishlistError = e => ({
  type: FETCH_CURRENT_USER_WISHLIST_ERROR,
  error: true,
  payload: e,
});

const fetchCurrentUserWishlistListingsRequest = () => ({
  type: FETCH_CURRENT_USER_WISHLIST_LISTING_REQUEST,
});

export const fetchCurrentUserWishlistListingsSuccess = listing => ({
  type: FETCH_CURRENT_USER_WISHLIST_LISTING_SUCCESS,
  payload: listing,
});

const fetchCurrentUserWishlistListingsError = e => ({
  type: FETCH_CURRENT_USER_WISHLIST_LISTING_ERROR,
  error: true,
  payload: e,
});

// ================ Thunks ================ //

export const fetchCurrentUserWishlist = params => (dispatch, getState, sdk) => {
  return sdk.currentUser
    .show()
    .then(response => {
      const wishlist = response.data.data.attributes.profile.privateData.wishlist;
      dispatch(fetchCurrentUserWishlistRequest());
      dispatch(fetchCurrentUserWishlistSuccess(wishlist));
      dispatch(fetchCurrentUserWishlistListings(wishlist));
    })
    .catch(e => dispatch(fetchCurrentUserWishlistError(storableError(e))));
};

export const fetchCurrentUserWishlistListings = params => (dispatch, getState, sdk) => {
  params.map(listing => {
    return sdk.listings
      .show({ id: listing })
      .then(response => {
        const listingObject = response.data.data.attributes;
        dispatch(fetchCurrentUserWishlistListingsSuccess(listingObject));
      })
      .catch(e => dispatch(fetchCurrentUserWishlistListingsError(storableError(e))));
  });
};

// export const loadData = (params, search) => dispatch => {
//   return Promise.all([dispatch(fetchCurrentUserWishlist(params))]);
// };
