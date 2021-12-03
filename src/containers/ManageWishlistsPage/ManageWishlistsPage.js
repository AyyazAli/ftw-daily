import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { createInstance, types as sdkTypes } from '../../util/sdkLoader';
import config from '../../config';
import * as apiUtils from '../../util/api';
import {
  Page,
  UserNav,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  Table,
} from '../../components';
import { TopbarContainer } from '../../containers';
import css from './ManageWishlistsPage.module.css';

const baseUrl = config.sdk.baseUrl ? { baseUrl: config.sdk.baseUrl } : {};

const sdk = createInstance({
  transitVerbose: config.sdk.transitVerbose,
  clientId: config.sdk.clientId,
  secure: config.usingSSL,
  typeHandlers: apiUtils.typeHandlers,
  ...baseUrl,
});

const ManageWishlistsPageComponent = props => {
  const { scrollingDisabled, intl } = props;

  const [wishlistListings, setWishlistListings] = useState([]);

  useEffect(() => {
    sdk.currentUser.show().then(response => {
      const wishlist = response.data.data.attributes.profile.privateData.wishlist || [];

      wishlist.forEach(listing => {
        sdk.listings.show({ id: listing }).then(response => {
          const res = response.data.data.attributes;
          setWishlistListings(prevState => [...prevState, res]);
        });
      });
    });
  }, []);

  const title = intl.formatMessage({ id: 'ManageWishlistsPage.title' });

  const NoResults = () => {
    return (
      <h1 className={css.noResults}>
        <FormattedMessage id="ManageWishlistsPage.noResults" />
      </h1>
    );
  };

  const formatLabel = amenity => {
    const label = amenity.charAt(0).toUpperCase() + amenity.slice(1);
    return label.replace(/_/g, ' ');
  };

  const formatPrice = price => {
    const { amount, currency } = price;

    return amount.toString().slice(0, -2) + ' ' + currency;
  };

  return (
    <Page title={title} scrollingDisabled={scrollingDisabled}>
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ManageWishlistsPage" />
          <UserNav selectedPageName="ManageWishlistsPage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div className={css.wishlistPanel}>
            {wishlistListings.length == 0 ? (
              <NoResults />
            ) : (
              <table className={css.table}>
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Price</th>
                    <th>Amenities</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistListings.map((wishlist, index) => {
                    return (
                      <tr key={index}>
                        <td>{wishlist.title}</td>
                        <td>{formatPrice(wishlist.price)}</td>
                        <td>
                          {wishlist.publicData.amenities.map((amenity, i) => {
                            return <li key={i}>{formatLabel(amenity)}</li>;
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

const { arrayOf } = PropTypes;

ManageWishlistsPageComponent.propTypes = {
  listings: arrayOf(propTypes.ownListing),
  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  return {
    currentUser,
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const ManageWishlistsPage = compose(
  connect(mapStateToProps),
  injectIntl
)(ManageWishlistsPageComponent);

export default ManageWishlistsPage;
