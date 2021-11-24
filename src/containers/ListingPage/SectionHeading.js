import React, { useState, useEffect } from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { InlineTextButton, Button, NamedRedirect } from '../../components';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY } from '../../util/types';
import config from '../../config';
import { ensureCurrentUser } from '../../util/data';
import { connect } from 'react-redux';
import { createInstance, types as sdkTypes } from '../../util/sdkLoader';
import * as apiUtils from '../../util/api';
import { useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import routeConfiguration from '../../routeConfiguration';
import { pathByRouteName } from '../../util/routes';

import css from './ListingPage.module.css';
import { addCurrentUserWishlist, fetchCurrentUserWishlist } from './ListingPage.duck';

const baseUrl = config.sdk.baseUrl ? { baseUrl: config.sdk.baseUrl } : {};

const sdk = createInstance({
  transitVerbose: config.sdk.transitVerbose,
  clientId: config.sdk.clientId,
  secure: config.usingSSL,
  typeHandlers: apiUtils.typeHandlers,
  ...baseUrl,
});

const SectionHeadingComponent = props => {
  const wishlistData = useSelector(state => state.ListingPage.wishlistArray);

  const {
    priceTitle,
    formattedPrice,
    richTitle,
    category,
    hostLink,
    showContactUser,
    onContactUser,
    listingId,
    currentUser,
    addCurrentUserWishlist,
    fetchCurrentUserWishlist,
    history,
  } = props;

  const [wishlists, setWishlists] = useState([]);

  useEffect(() => {
    fetchCurrentUserWishlist();
    setWishlists(wishlistData);
    console.log('Initial loading of wishlist array: ', wishlistData);
  }, []);

  const unitType = config.bookingUnitType;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;

  const unitTranslationKey = isNightly
    ? 'ListingPage.perNight'
    : isDaily
    ? 'ListingPage.perDay'
    : 'ListingPage.perUnit';

  const user = ensureCurrentUser(currentUser);

  const { profile } = user.attributes;
  const privateData = profile.privateData || {};

  const handleWishlist = () => {
    if (!user.id) {
      const path = pathByRouteName('LoginPage', routeConfiguration());
      history.push(path);
    } else {
      console.log('Wishlist array to be passed to the state', wishlists);
      const params = {
        listing: listingId.uuid,
        privateData: privateData,
        wishlists: wishlists,
      };
      addCurrentUserWishlist(params);
      alert('Wishlist added');
    }
  };

  return (
    <div className={css.sectionHeading}>
      <div className={css.desktopPriceContainer}>
        <div className={css.desktopPriceValue} title={priceTitle}>
          {formattedPrice}
        </div>
        <div className={css.desktopPerUnit}>
          <FormattedMessage id={unitTranslationKey} />
        </div>
      </div>
      <div className={css.heading}>
        <h1 className={css.title}>{richTitle}</h1>
        <div className={css.author}>
          {category}
          <FormattedMessage id="ListingPage.hostedBy" values={{ name: hostLink }} />
          {showContactUser ? (
            <span className={css.contactWrapper}>
              <span className={css.separator}>•</span>
              <InlineTextButton
                rootClassName={css.contactLink}
                onClick={onContactUser}
                enforcePagePreloadFor="SignupPage"
              >
                <FormattedMessage id="ListingPage.contactUser" />
              </InlineTextButton>
            </span>
          ) : null}
          <Button onClick={handleWishlist}>
            <FormattedMessage id="ListingPage.wishListButton" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  const { isAuthenticated } = state.Auth;
  const { currentUser } = state.user;
  const { wishlistArray } = state.ListingPage;
  return {
    isAuthenticated,
    currentUser,
    wishlistArray,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addCurrentUserWishlist: params => dispatch(addCurrentUserWishlist(params)),
    fetchCurrentUserWishlist: params => dispatch(fetchCurrentUserWishlist(params)),
  };
};

const SectionHeading = connect(
  mapStateToProps,
  mapDispatchToProps
)(SectionHeadingComponent);

export default SectionHeading;
