import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    BlockControls,
    AlignmentToolbar,
    InspectorControls
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl
} from '@wordpress/components';

const FrameBlock = ({ attributes, setAttributes, clientId }) => {
    const { align, frameTitle } = attributes;

    const blockProps = useBlockProps({
        className: 'fsc-frame'
    });

    return (
        <>
            <BlockControls>
                <AlignmentToolbar
                    value={align}
                    onChange={(newAlign) => setAttributes({ align: newAlign })}
                />
            </BlockControls>

            <InspectorControls>
                <PanelBody title={__('Frame Title', 'flexible-slider-and-carousel')} initialOpen={true}>
                    <TextControl
                        label={__('Navigation Title', 'flexible-slider-and-carousel')}
                        value={frameTitle || ''}
                        onChange={(value) => setAttributes({ frameTitle: value })}
                        help={__('This title will be used in the text navigation. Leave empty to use content from the frame.', 'flexible-slider-and-carousel')}
                        placeholder={__('Enter frame title...', 'flexible-slider-and-carousel')}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className="fsc-frame__content">
                    <InnerBlocks
                        allowedBlocks={[
                            'core/paragraph',
                            'core/cover',
                            'core/image',
                            'core/list',
                            'core/group'
                        ]}
                    />
                </div>
            </div>
        </>
    );
};

// Export for block.json
export const edit = FrameBlock;
export const save = () => <InnerBlocks.Content />;

// Block registrieren
registerBlockType('flexible-slider-carousel/frame', {
    edit: FrameBlock,
    save: () => <InnerBlocks.Content />
});
