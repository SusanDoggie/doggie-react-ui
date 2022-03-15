//
//  index.ios.js
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
import { RefreshControl as RNRefreshControl } from 'react-native';
import ScrollViewBase from './ScrollViewBase';
import RefreshControl from './RefreshControl';
import { useMergeRefs } from 'sugax';

const ScrollViewContext = React.createContext({ current: null });
export const useScrollView = () => React.useContext(ScrollViewContext);

const ScrollLayoutContext = React.createContext({ current: null });
export const useScrollLayout = () => React.useContext(ScrollLayoutContext);

export const ScrollView = React.forwardRef(({
    onRefresh,
    onScroll,
    refreshControlProps,
    scrollEventThrottle = 16,
    children,
    ...props
}, forwardRef) => {

    const scrollViewRef = React.useRef();
    const ref = useMergeRefs(scrollViewRef, forwardRef);
    
    const [scrollLayout, setScrollLayout] = React.useState();
    
    return <ScrollViewBase
        ref={ref}
        onScroll={(event) => {
            setScrollLayout(event.nativeEvent);
            if (_.isFunction(onScroll)) onScroll(event);
        }}
        scrollEventThrottle={scrollEventThrottle}
        refreshControl={_.isFunction(onRefresh) ? <RefreshControl onRefresh={onRefresh} {...refreshControlProps} /> : null}
        {...props}>
            <ScrollViewContext.Provider value={scrollViewRef}><ScrollLayoutContext.Provider value={scrollLayout}>
                {children}
            </ScrollLayoutContext.Provider></ScrollViewContext.Provider>
        </ScrollViewBase>;
});

export default ScrollView;