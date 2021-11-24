import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
} from '../../components';
import { TopbarContainer } from '../../containers';

import {
  fetchCurrentUserWishlist,
  fetchCurrentUserWishlistListings,
} from './ManageWishlistsPage.duck';
import css from './ManageWishlistsPage.module.css';
import { useSelector } from 'react-redux';

const ManageWishlistsPageComponent = props => {
  const {
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled,
    currentUser,
    intl,
    fetchCurrentUserWishlist,
    fetchCurrentUserWishlistListings,
  } = props;

  const listings = useSelector(state => state.ManageWishlistPage.listings);

  const loadingResults = (
    <h2>
      <FormattedMessage id="ManageListingsPage.loadingOwnListings" />
    </h2>
  );

  const title = intl.formatMessage({ id: 'ManageWishlistsPage.title' });

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ManageListingsPage" />
          <UserNav selectedPageName="ManageListingsPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <h1>Your Wishlists</h1>

          {!listings ? (
            loadingResults
          ) : (
            <table>
              <tr>
                <th>Title</th>
                <th>Price</th>
                <th>Amenities</th>
              </tr>
              {listings.map((wishlist, index) => {
                return (
                  <tr key={index}>
                    <td>{wishlist.title}</td>
                    <td>
                      {wishlist.price.amount} {wishlist.price.currency}
                    </td>
                    <td>
                      {wishlist.publicData.amenities.map((amenity, i) => {
                        return <li key={i}> {amenity} </li>;
                      })}
                    </td>
                  </tr>
                );
              })}
            </table>
          )}
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

ManageWishlistsPageComponent.defaultProps = {
  listings: [],
  pagination: null,
  queryListingsError: null,
  queryParams: null,
  closingListing: null,
  closingListingError: null,
  openingListing: null,
  openingListingError: null,
};

const { arrayOf, bool, func, object, shape, string } = PropTypes;

ManageWishlistsPageComponent.propTypes = {
  listings: arrayOf(propTypes.ownListing),
  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  } = state.ManageListingsPage;
  return {
    currentPageResultIds,
    pagination,
    queryInProgress,
    queryListingsError,
    queryParams,
    scrollingDisabled: isScrollingDisabled(state),
    openingListing,
    openingListingError,
    closingListing,
    closingListingError,
  };
};

const mapDispatchToProps = dispatch => ({
  fetchCurrentUserWishlist: params => dispatch(fetchCurrentUserWishlist(params)),
  fetchCurrentUserWishlistListings: params => dispatch(fetchCurrentUserWishlistListings(params)),
});

const ManageWishlistsPage = compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  injectIntl
)(ManageWishlistsPageComponent);

export default ManageWishlistsPage;
