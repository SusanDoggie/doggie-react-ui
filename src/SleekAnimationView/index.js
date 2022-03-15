//
//  index.js
//
//  The MIT License
//  Copyright (c) 2015 - 2022 Susan Cheng. All rights reserved.
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.
//

import _ from 'lodash';
import React from 'react';
import { Image } from 'react-native';
import { List } from '../List';
import { StickyView } from '../StickyView';

export const SleekAnimationView = React.forwardRef(({
    backgroundContainerStyle,
    backgroundStyle,
    backgroundImages: images = [],
    resizeMode,
    children,
    ...props
}, forwardRef) => {

    return <StickyView
    ref={forwardRef}
    stickyContainerStyle={[{ zIndex: -1 }, backgroundContainerStyle]}
    stickyView={({offset}) => <List 
        data={images} 
        renderItem={({ item, index }) => <Image
            source={item}
            style={[{ width: '100%', height: '100%', display: index === Math.min(images.length - 1, Math.floor(offset * images.length)) ? 'flex' : 'none' }, backgroundStyle]}
            resizeMode={resizeMode} />} />}
    {...props}>
        {children}
    </StickyView>;
});

export default SleekAnimationView;