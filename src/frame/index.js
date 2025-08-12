import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';

const FrameBlock = ({ attributes, setAttributes }) => {
    const { align } = attributes;

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
