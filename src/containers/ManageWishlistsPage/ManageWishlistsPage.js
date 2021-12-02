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
} from '../../components';
import { TopbarContainer } from '../../containers';

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
      const wishlist = response.data.data.attributes.profile.privateData.wishlist;

      wishlist.forEach(listing => {
        sdk.listings.show({ id: listing }).then(response => {
          const res = response.data.data.attributes;
          setWishlistListings(prevState => [...prevState, res]);
        });
      });
    });
  }, []);

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

          {wishlistListings.length < 0 ? (
            <h1>No wishlists</h1>
          ) : (
            <table>
              <tbody>
                <tr>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Amenities</th>
                </tr>
                {wishlistListings.map((wishlist, index) => {
                  return (
                    <tr key={index}>
                      <td>{wishlist.title}</td>
                      <td>
                        {wishlist.price.amount.toString().slice(0, -2)} {wishlist.price.currency}
                      </td>
                      <td>
                        {wishlist.publicData.amenities.map((amenity, i) => {
                          return <li key={i}> {amenity} </li>;
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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

const { arrayOf, bool, func, object, shape, string } = PropTypes;

ManageWishlistsPageComponent.propTypes = {
  listings: arrayOf(propTypes.ownListing),
  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUser } = state.user;
  return {
    currentUser,
  };
};

const ManageWishlistsPage = compose(
  connect(mapStateToProps),
  injectIntl
)(ManageWishlistsPageComponent);

export default ManageWishlistsPage;
